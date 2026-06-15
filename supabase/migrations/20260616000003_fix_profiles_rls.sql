-- Drop the recursive policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Owners can update profiles in their tenant" ON profiles;
DROP POLICY IF EXISTS "Owners can delete profiles in their tenant" ON profiles;

-- Create a helper function to bypass RLS and get a user's tenant ID securely
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate policies using the helper function to avoid infinite recursion
CREATE POLICY "Users can view profiles in their tenant" 
ON profiles FOR SELECT 
USING (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Owners can update profiles in their tenant"
ON profiles FOR UPDATE
USING (
  tenant_id = public.get_auth_tenant_id() 
  AND public.get_auth_role() = 'owner'
);

CREATE POLICY "Owners can delete profiles in their tenant"
ON profiles FOR DELETE
USING (
  tenant_id = public.get_auth_tenant_id()
  AND public.get_auth_role() = 'owner'
);
