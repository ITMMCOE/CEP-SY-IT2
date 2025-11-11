import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AboutEditor() {
  const [content, setContent] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('content_key', 'about_content')
      .maybeSingle();
    
    if (data) {
      setContent(data.content_value);
      setContentId(data.id);
    }
  };

  const handleSave = async () => {
    if (contentId) {
      const { error } = await supabase
        .from('site_content')
        .update({ content_value: content })
        .eq('id', contentId);
      
      if (error) {
        toast({ title: 'Error updating content', variant: 'destructive' });
      } else {
        toast({ title: 'About page updated successfully' });
      }
    } else {
      const { error } = await supabase.from('site_content').insert({
        content_key: 'about_content',
        content_type: 'html',
        content_value: content,
        page: 'about',
        description: 'About page main content',
      });
      
      if (error) {
        toast({ title: 'Error creating content', variant: 'destructive' });
      } else {
        toast({ title: 'About page created successfully' });
        fetchAboutContent();
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">About Page Editor</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="about-content">About Yarn Yantra Content</Label>
          <Textarea
            id="about-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono"
            placeholder="Enter HTML or plain text content..."
          />
          <p className="text-sm text-muted-foreground mt-2">
            You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, etc.)
          </p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
