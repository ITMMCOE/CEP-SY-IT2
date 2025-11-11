-- Create payment_settings table for admin-controlled payment details
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_url text NOT NULL,
  upi_id text NOT NULL,
  upi_number text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage payment settings
CREATE POLICY "Admins can manage payment settings"
  ON public.payment_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view payment settings
CREATE POLICY "Everyone can view payment settings"
  ON public.payment_settings
  FOR SELECT
  USING (true);

-- Add payment_screenshot column to orders
ALTER TABLE public.orders ADD COLUMN payment_screenshot text;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', false);

-- Storage policies for payment screenshots
CREATE POLICY "Users can upload their payment screenshots"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-screenshots' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own payment screenshots"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'payment-screenshots' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all payment screenshots"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'payment-screenshots' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Insert default payment settings (admin should update these)
INSERT INTO public.payment_settings (qr_code_url, upi_id, upi_number)
VALUES ('https://placeholder.com/qr', 'admin@upi', '9999999999');

-- Add trigger for payment_settings updated_at
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();