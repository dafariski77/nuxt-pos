-- Add payment columns to transactions
ALTER TABLE transactions 
ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cash',
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'paid',
ADD COLUMN payment_reference TEXT;
