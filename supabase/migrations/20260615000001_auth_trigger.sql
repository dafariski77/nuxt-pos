-- Function to handle new user signups via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id UUID;
  store_name TEXT;
BEGIN
  -- Extract store_name from metadata, or default to 'Toko Saya'
  store_name := COALESCE(NEW.raw_user_meta_data->>'store_name', 'Toko Saya');

  -- Insert into tenants
  INSERT INTO public.tenants (name) VALUES (store_name) RETURNING id INTO new_tenant_id;
  
  -- Insert into profiles linking auth user to tenant
  INSERT INTO public.profiles (user_id, tenant_id, role) VALUES (NEW.id, new_tenant_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create tenant and profile when a new user signs up in Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- We can optionally drop the old RPC function as it's no longer used
DROP FUNCTION IF EXISTS public.create_tenant(TEXT);
