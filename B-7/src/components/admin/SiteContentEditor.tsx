import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  page: string;
  description: string;
}

export default function SiteContentEditor() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [editingContent, setEditingContent] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSiteContent();
  }, []);

  const fetchSiteContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('content_type', 'image')
      .neq('page', 'gallery')
      .order('page');
    
    if (error) {
      toast({ title: 'Error fetching site content', variant: 'destructive' });
    } else {
      setContents(data || []);
      const initialEditing: { [key: string]: string } = {};
      data?.forEach(content => {
        initialEditing[content.id] = content.content_value;
      });
      setEditingContent(initialEditing);
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('site_content')
      .update({ content_value: editingContent[id] })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error updating content', variant: 'destructive' });
    } else {
      toast({ title: 'Content updated successfully' });
      fetchSiteContent();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Site Content Editor</h2>
      <p className="text-muted-foreground mb-6">
        Edit images displayed across different pages of your website
      </p>
      
      <div className="grid gap-4">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{content.page} Page</CardTitle>
              <p className="text-sm text-muted-foreground">{content.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.content_value && (
                <img 
                  src={content.content_value} 
                  alt={content.description}
                  className="w-full max-w-md h-48 object-cover rounded"
                />
              )}
              <div>
                <Label htmlFor={`content-${content.id}`}>Image URL</Label>
                <Input
                  id={`content-${content.id}`}
                  value={editingContent[content.id] || ''}
                  onChange={(e) => setEditingContent({ 
                    ...editingContent, 
                    [content.id]: e.target.value 
                  })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={() => handleUpdate(content.id)}>
                Update Image
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
