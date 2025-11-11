import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, type, userId, speakerVerified = false } = await req.json();
    console.log('Received command:', command, 'Type:', type, 'UserId:', userId, 'Speaker verified:', speakerVerified);
    
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Initialize Supabase client for data access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch inventory data for context
    const { data: inventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId);
    
    const { data: sales } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('sale_date', { ascending: false })
      .limit(50);

    // Prepare the system prompt
    const systemPrompt = `You are an AI assistant for inventory management. Parse voice commands and extract structured data.

Current inventory: ${JSON.stringify(inventory)}
Recent sales: ${JSON.stringify(sales?.slice(0, 10))}

Supported commands and their formats:
1. ADD to inventory: "add [quantity] [item] of [price] rupees" or "register [item] with [quantity] units at [price] rupees"
2. REMOVE from inventory: "remove [quantity] [item]" or "delete [quantity] of [item]"
3. SELL/SALE: "sell [quantity] [item] for [price] rupees" or "sold [quantity] [item]"
4. QUERY: "what is stock of [item]" or "check inventory of [item]" or "how many [item]"
5. LIST LOW STOCK: "show low stock items" or "list items with low stock"
6. SUMMARY: "show inventory summary" or "give me inventory overview"

Extract and respond with a JSON object:
{
  "action": "add|remove|sell|query|list_low_stock|summary",
  "itemName": "string (product name)",
  "quantity": number (for add/remove/sell),
  "price": number (for add/sell),
  "message": "string (user-friendly response message)"
}

Examples:
- "add 20 pens of 10 rupees" -> {"action":"add","itemName":"pens","quantity":20,"price":10,"message":"Added 20 pens at ₹10 each"}
- "sell 5 notebooks for 50 rupees each" -> {"action":"sell","itemName":"notebooks","quantity":5,"price":50,"message":"Sold 5 notebooks for ₹250"}
- "remove 3 erasers" -> {"action":"remove","itemName":"erasers","quantity":3,"message":"Removed 3 erasers from inventory"}
- "check stock of pens" -> {"action":"query","itemName":"pens","message":"Checking pen inventory..."}
- "show low stock items" -> {"action":"list_low_stock","message":"Listing items with low stock"}
- "inventory summary" -> {"action":"summary","message":"Generating inventory summary"}

IMPORTANT: Always respond with valid JSON only, no additional text.`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: command }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Try to parse as JSON
    let parsedResponse;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      parsedResponse = { 
        action: 'unknown',
        message: aiResponse,
        error: 'Failed to parse command'
      };
    }

    // Log the command to audit_logs
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        command_text: command,
        action_type: parsedResponse.action || 'unknown',
        item_name: parsedResponse.itemName || null,
        quantity: parsedResponse.quantity || null,
        status: parsedResponse.error ? 'failed' : 'success',
        result_message: parsedResponse.message || null,
        speaker_verified: speakerVerified
      });
    } catch (auditError) {
      console.error('Failed to log audit entry:', auditError);
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    // Log failed command to audit
    try {
      const bodyText = await req.text();
      const body = JSON.parse(bodyText);
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      if (body.userId) {
        await supabase.from('audit_logs').insert({
          user_id: body.userId,
          command_text: body.command || 'unknown',
          action_type: 'error',
          status: 'failed',
          result_message: (error as Error).message
        });
      }
    } catch (auditError) {
      console.error('Failed to log error audit entry:', auditError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
