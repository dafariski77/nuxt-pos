import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { email, password, role, tenantId } = body

  if (!email || !password || !tenantId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Use service role to bypass RLS and create user
  const supabaseAdmin = serverSupabaseServiceRole(event)

  // Verify that the requestor is an 'owner' of the tenantId
  const { data: requestorProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .single()

  if (!requestorProfile || requestorProfile.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only owners can create users' })
  }

  // Create the user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      tenant_id: tenantId,
      role: role || 'employee'
    }
  })

  if (authError) {
    throw createError({ statusCode: 400, statusMessage: authError.message })
  }

  return { success: true, user: authData.user }
})
