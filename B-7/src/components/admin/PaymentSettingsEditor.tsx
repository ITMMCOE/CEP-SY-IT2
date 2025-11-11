import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function PaymentSettingsEditor() {
  const [settings, setSettings] = useState({
    id: '',
    qr_code_url: '',
    upi_id: '',
    upi_number: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .single();
    
    if (error) {
      toast.error('Error fetching payment settings');
    } else if (data) {
      setSettings(data);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('payment_settings')
      .update({
        qr_code_url: settings.qr_code_url,
        upi_id: settings.upi_id,
        upi_number: settings.upi_number,
      })
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to update payment settings');
    } else {
      toast.success('Payment settings updated successfully');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Payment Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Configure Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="qr_code">QR Code URL</Label>
              <Input
                id="qr_code"
                value={settings.qr_code_url}
                onChange={(e) => setSettings({ ...settings, qr_code_url: e.target.value })}
                placeholder="https://example.com/qr-code.png"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload QR code image and paste the URL here
              </p>
            </div>
            <div>
              <Label htmlFor="upi_id">UPI ID</Label>
              <Input
                id="upi_id"
                value={settings.upi_id}
                onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                placeholder="yourname@upi"
                required
              />
            </div>
            <div>
              <Label htmlFor="upi_number">UPI Number / Phone</Label>
              <Input
                id="upi_number"
                value={settings.upi_number}
                onChange={(e) => setSettings({ ...settings, upi_number: e.target.value })}
                placeholder="9999999999"
                required
              />
            </div>
            {settings.qr_code_url && (
              <div>
                <Label>Current QR Code Preview</Label>
                <img 
                  src={settings.qr_code_url} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain border rounded mt-2"
                />
              </div>
            )}
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}