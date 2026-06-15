-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS tenants;

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'owner',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Minuman',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    total_amount BIGINT NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- 1. Tenants Policy
-- Users can only see their own tenant
CREATE POLICY "Users can view their own tenant" 
ON tenants FOR SELECT 
USING (id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- 2. Profiles Policy
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

-- 3. Products Policy
-- Users can view, insert, update, delete products in their tenant
CREATE POLICY "Tenant users can view products" 
ON products FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can insert products" 
ON products FOR INSERT 
WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can update products" 
ON products FOR UPDATE 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can delete products" 
ON products FOR DELETE 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- 4. Transactions Policy
CREATE POLICY "Tenant users can view transactions" 
ON transactions FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can insert transactions" 
ON transactions FOR INSERT 
WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- RPC function to create tenant and profile for new user
CREATE OR REPLACE FUNCTION create_tenant(store_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Check if user already has a profile
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'User already belongs to a tenant';
  END IF;

  -- Insert into tenants
  INSERT INTO tenants (name) VALUES (store_name) RETURNING id INTO new_tenant_id;
  
  -- Insert into profiles linking auth user to tenant
  INSERT INTO profiles (user_id, tenant_id, role) VALUES (auth.uid(), new_tenant_id, 'owner');
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-set tenant_id on insert
CREATE OR REPLACE FUNCTION set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    SELECT tenant_id INTO NEW.tenant_id FROM profiles WHERE user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_tenant_id_products
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_tenant_id_transactions
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_tenant_id();
