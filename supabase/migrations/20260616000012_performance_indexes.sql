-- Index untuk mempercepat RLS policy pada transactions
-- RLS: tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
