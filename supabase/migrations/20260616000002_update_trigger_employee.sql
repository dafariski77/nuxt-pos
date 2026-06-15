-- Update trigger handle_new_user to handle tenant_id from meta with employee default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id UUID;
  store_name TEXT;
BEGIN
  IF NEW.raw_user_meta_data->>'tenant_id' IS NOT NULL THEN
     -- User is created by an owner to join an existing tenant
     INSERT INTO public.profiles (user_id, tenant_id, role) 
     VALUES (NEW.id, (NEW.raw_user_meta_data->>'tenant_id')::UUID, COALESCE(NEW.raw_user_meta_data->>'role', 'employee'));
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

-- Update existing 'kasir' roles to 'employee'
UPDATE public.profiles SET role = 'employee' WHERE role = 'kasir';
