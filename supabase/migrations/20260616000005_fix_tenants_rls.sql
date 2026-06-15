DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;

CREATE POLICY "Users can view their own tenant" 
ON tenants FOR SELECT 
USING (id = public.get_auth_tenant_id());
