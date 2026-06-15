-- Ensure users can always view their own profile without any complex tenant checks
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (user_id = auth.uid());
