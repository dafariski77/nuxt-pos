-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Minuman',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount BIGINT NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert dummy products
INSERT INTO products (name, price, category, image_url) VALUES
('Kopi Susu Aren', 18000, 'Kopi', '/images/kopi_susu.png'),
('Espresso', 15000, 'Kopi', '/images/espresso.png'),
('Caramel Latte', 24000, 'Kopi', '/images/caramel_latte.png'),
('Americano', 18000, 'Kopi', '/images/americano.png'),
('Iced Matcha Latte', 22000, 'Non-Kopi', '/images/matcha_latte.png'),
('Red Velvet Latte', 22000, 'Non-Kopi', '/images/red_velvet.png'),
('Chocolate Signature', 20000, 'Non-Kopi', '/images/chocolate.png'),
('Butter Croissant', 18000, 'Makanan', '/images/croissant.png'),
('Almond Croissant', 25000, 'Makanan', '/images/almond_croissant.png'),
('Fudge Brownie', 15000, 'Makanan', '/images/brownie.png');
