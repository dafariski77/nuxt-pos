-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, name)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Category Policies
CREATE POLICY "Tenant users can view categories" 
ON categories FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can insert categories" 
ON categories FOR INSERT 
WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can update categories" 
ON categories FOR UPDATE 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can delete categories" 
ON categories FOR DELETE 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Trigger function for categories tenant_id
CREATE TRIGGER set_tenant_id_categories
BEFORE INSERT ON categories
FOR EACH ROW
EXECUTE FUNCTION set_tenant_id();

-- Migrate existing distinct categories from products table to categories table
INSERT INTO categories (tenant_id, name)
SELECT DISTINCT tenant_id, category FROM products;

-- Modify products table to use category_id instead of category text
ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE RESTRICT;

-- Map existing categories to category_id
UPDATE products p SET category_id = c.id 
FROM categories c 
WHERE p.tenant_id = c.tenant_id AND p.category = c.name;

-- Make category_id NOT NULL and drop old category text column
-- Note: if there are products with no matching category (shouldn't happen), this would fail.
-- Assuming data integrity is intact.
ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE products DROP COLUMN category;

-- Update trigger handle_new_user to handle tenant_id from meta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id UUID;
  store_name TEXT;
BEGIN
  IF NEW.raw_user_meta_data->>'tenant_id' IS NOT NULL THEN
     -- User is created by an owner to join an existing tenant
     INSERT INTO public.profiles (user_id, tenant_id, role) 
     VALUES (NEW.id, (NEW.raw_user_meta_data->>'tenant_id')::UUID, COALESCE(NEW.raw_user_meta_data->>'role', 'kasir'));
  ELSE
     -- Normal self-signup
     store_name := COALESCE(NEW.raw_user_meta_data->>'store_name', 'Toko Saya');
     INSERT INTO public.tenants (name) VALUES (store_name) RETURNING id INTO new_tenant_id;
     INSERT INTO public.profiles (user_id, tenant_id, role) VALUES (NEW.id, new_tenant_id, 'owner');
     
     -- Create default categories for the new store
     INSERT INTO public.categories (tenant_id, name) VALUES 
     (new_tenant_id, 'Minuman'),
     (new_tenant_id, 'Makanan'),
     (new_tenant_id, 'Snack');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles RLS to allow users in the same tenant to see each other
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view profiles in their tenant" 
ON profiles FOR SELECT 
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update profiles in their tenant"
ON profiles FOR UPDATE
USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role = 'owner')
);

CREATE POLICY "Owners can delete profiles in their tenant"
ON profiles FOR DELETE
USING (
  tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() AND role = 'owner')
);
