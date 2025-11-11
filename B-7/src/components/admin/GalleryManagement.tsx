import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GalleryImage {
  id: string;
  content_value: string;
  description: string;
}

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', 'gallery')
      .eq('content_type', 'image')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error fetching gallery images', variant: 'destructive' });
    } else {
      setImages(data || []);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('site_content').insert({
      content_key: `gallery_${Date.now()}`,
      content_type: 'image',
      content_value: imageUrl,
      page: 'gallery',
      description: description,
    });
    
    if (error) {
      toast({ title: 'Error adding image', variant: 'destructive' });
    } else {
      toast({ title: 'Image added successfully' });
      fetchGalleryImages();
      setImageUrl('');
      setDescription('');
      setIsOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    const { error } = await supabase.from('site_content').delete().eq('id', id);
    
    if (error) {
      toast({ title: 'Error deleting image', variant: 'destructive' });
    } else {
      toast({ title: 'Image deleted successfully' });
      fetchGalleryImages();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gallery Management</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Gallery Image</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Image description"
                />
              </div>
              <Button type="submit" className="w-full">Add Image</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img 
              src={image.content_value} 
              alt={image.description || 'Gallery image'} 
              className="aspect-square w-full object-cover rounded-lg"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(image.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {image.description && (
              <p className="mt-2 text-sm text-muted-foreground">{image.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
