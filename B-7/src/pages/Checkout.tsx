import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // New address form
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCartItems();
    fetchAddresses();
    fetchPaymentSettings();
  }, [user]);

  const fetchPaymentSettings = async () => {
    const { data } = await supabase
      .from('payment_settings')
      .select('*')
      .single();
    
    if (data) setPaymentSettings(data);
  };

  const fetchCartItems = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user!.id);
    
    if (data) {
      if (data.length === 0) {
        navigate('/cart');
      } else {
        setCartItems(data);
      }
    }
  };

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false });
    
    if (data) {
      setAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user!.id,
        address_line1: newAddress.addressLine1,
        address_line2: newAddress.addressLine2,
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.postalCode,
        is_default: addresses.length === 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add address');
      return;
    }

    toast.success('Address added successfully');
    setNewAddress({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
    });
    await fetchAddresses();
    if (data) setSelectedAddress(data.id);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `YY${Date.now()}`;
      const total = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user!.id,
          total_amount: total,
          status: 'pending',
          payment_method: 'upi',
          shipping_address_id: selectedAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of cartItems) {
        await supabase
          .from('products')
          .update({
            stock_quantity: item.products.stock_quantity - item.quantity,
          })
          .eq('id', item.products.id);
      }

      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id);

      setOrderId(order.id);
      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    if (!paymentScreenshot || !orderId) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setLoading(true);
    try {
      const fileExt = paymentScreenshot.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, paymentScreenshot);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_screenshot: fileName })
        .eq('id', orderId);

      if (updateError) throw updateError;

      toast.success('Payment screenshot uploaded! Awaiting admin approval.');
      setShowPaymentDialog(false);
      navigate('/profile?tab=orders');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload screenshot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  const total = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Delivery Address</h2>

              {addresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-2">
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <div className="p-3 border border-border rounded-lg">
                            <p className="font-medium">{address.address_line1}</p>
                            {address.address_line2 && <p className="text-sm">{address.address_line2}</p>}
                            <p className="text-sm">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            {address.is_default && (
                              <span className="text-xs text-accent">Default</span>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Add New Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddAddress} variant="outline">
                  Add Address
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.products.name} x {item.quantity}
                    </span>
                    <span>₹{(item.products.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pt-3 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          {paymentSettings && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={paymentSettings.qr_code_url} 
                  alt="Payment QR Code"
                  className="w-48 h-48 mx-auto object-contain border rounded"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-semibold">UPI ID</Label>
                  <p className="text-sm">{paymentSettings.upi_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">UPI Number</Label>
                  <p className="text-sm">{paymentSettings.upi_number}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshot">Upload Payment Screenshot *</Label>
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <Button 
                onClick={handlePaymentComplete}
                disabled={loading || !paymentScreenshot}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {loading ? 'Uploading...' : 'Payment Completed'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}