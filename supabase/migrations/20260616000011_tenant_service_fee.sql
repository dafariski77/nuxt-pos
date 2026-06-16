-- Tambahkan kolom service_fee ke tabel tenants
-- Default 10% (10), bisa diubah per tenant oleh owner
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS service_fee NUMERIC NOT NULL DEFAULT 10;
