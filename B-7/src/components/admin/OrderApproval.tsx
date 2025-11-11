import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  payment_screenshot: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
  };
  order_items: Array<{
    quantity: number;
    products: {
      name: string;
    };
  }>;
}

export default function OrderApproval() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name, phone),
        order_items (quantity, products (name))
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Error fetching orders');
    } else {
      setOrders(data as any || []);
    }
  };

  const handleApprove = async (orderId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'payment_approved' })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to approve order');
    } else {
      toast.success('Order approved successfully');
      fetchPendingOrders();
    }
    setLoading(false);
  };

  const handleReject = async (orderId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'payment_rejected' })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to reject order');
    } else {
      toast.success('Order rejected');
      fetchPendingOrders();
    }
    setLoading(false);
  };

  const getScreenshotUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('payment-screenshots').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Order Approval</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.order_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary">{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Customer Details</h4>
                <p className="text-sm">Name: {order.profiles?.full_name || 'N/A'}</p>
                <p className="text-sm">Phone: {order.profiles?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                {order.order_items?.map((item, idx) => (
                  <p key={idx} className="text-sm">
                    {item.products?.name} x {item.quantity}
                  </p>
                ))}
              </div>

              <div>
                <h4 className="font-semibold">Total: ₹{order.total_amount}</h4>
              </div>

              {order.payment_screenshot && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Screenshot</h4>
                  <a 
                    href={getScreenshotUrl(order.payment_screenshot) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    View Screenshot <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleApprove(order.id)}
                  disabled={loading}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Payment
                </Button>
                <Button 
                  onClick={() => handleReject(order.id)}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No pending orders for approval
          </p>
        )}
      </div>
    </div>
  );
}