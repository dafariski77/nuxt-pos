-- Create tenants and profiles for users that exist in auth.users but don't have a profile
DO $$
DECLARE
    user_record RECORD;
    new_tenant_id UUID;
BEGIN
    FOR user_record IN 
        SELECT id, raw_user_meta_data FROM auth.users 
        WHERE id NOT IN (SELECT user_id FROM public.profiles)
    LOOP
        -- Insert a new tenant for the user
        INSERT INTO public.tenants (name) 
        VALUES (COALESCE(user_record.raw_user_meta_data->>'store_name', 'Toko Saya'))
        RETURNING id INTO new_tenant_id;

        -- Insert a new profile as owner
        INSERT INTO public.profiles (user_id, tenant_id, role) 
        VALUES (user_record.id, new_tenant_id, 'owner');
        
        -- Create default categories
        INSERT INTO public.categories (tenant_id, name) VALUES 
        (new_tenant_id, 'Minuman'),
        (new_tenant_id, 'Makanan'),
        (new_tenant_id, 'Snack');
    END LOOP;
END;
$$;
