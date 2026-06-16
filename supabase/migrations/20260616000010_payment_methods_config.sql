CREATE TABLE payment_methods_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT,
  fee_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  fee_amount NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert defaults
INSERT INTO payment_methods_config (code, name, provider, fee_type, fee_amount) VALUES 
('cash', 'Tunai', NULL, 'fixed', 0),
('qris', 'QRIS / e-Wallet', 'xendit', 'percentage', 0.7);

-- Enable RLS
ALTER TABLE payment_methods_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Allow public read payment methods" ON payment_methods_config FOR SELECT USING (true);

-- Only super admin can modify
CREATE POLICY "Allow super_admin to update payment methods" ON payment_methods_config FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )
);
