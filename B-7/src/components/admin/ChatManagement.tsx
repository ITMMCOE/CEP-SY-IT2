import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  reply: string | null;
  status: string;
  created_at: string;
  replied_at: string | null;
}

export default function ChatManagement() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error fetching messages', variant: 'destructive' });
    } else {
      setMessages(data || []);
    }
  };

  const handleReply = async (messageId: string) => {
    const reply = replyText[messageId];
    if (!reply?.trim()) {
      toast({ title: 'Please enter a reply', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({
        reply: reply,
        status: 'replied',
        replied_at: new Date().toISOString(),
        replied_by: user?.id,
      })
      .eq('id', messageId);
    
    if (error) {
      toast({ title: 'Error sending reply', variant: 'destructive' });
    } else {
      toast({ title: 'Reply sent successfully' });
      setReplyText({ ...replyText, [messageId]: '' });
      fetchMessages();
    }
  };

  const handleStatusChange = async (messageId: string, status: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ status })
      .eq('id', messageId);
    
    if (error) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    } else {
      toast({ title: 'Status updated' });
      fetchMessages();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'replied': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Chat Messages</h2>
      
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Customer Inquiry
                </CardTitle>
                <Badge className={getStatusColor(message.status)}>
                  {message.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold mb-1">Customer Message:</p>
                <p className="text-sm bg-muted p-3 rounded">{message.message}</p>
              </div>
              
              {message.reply && (
                <div>
                  <p className="font-semibold mb-1">Your Reply:</p>
                  <p className="text-sm bg-primary/10 p-3 rounded">{message.reply}</p>
                  {message.replied_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Replied on {new Date(message.replied_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              
              {message.status !== 'closed' && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText[message.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [message.id]: e.target.value })}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleReply(message.id)}>
                      Send Reply
                    </Button>
                    {message.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleStatusChange(message.id, 'closed')}
                      >
                        Mark as Closed
                      </Button>
                    )}
                    {message.status === 'replied' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleStatusChange(message.id, 'closed')}
                      >
                        Close Conversation
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No messages yet</p>
        )}
      </div>
    </div>
  );
}
