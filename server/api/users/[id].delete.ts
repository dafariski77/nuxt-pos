import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userIdToDelete = getRouterParam(event, 'id')
  if (!userIdToDelete) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user ID' })
  }

  // Use service role to bypass RLS
  const supabaseAdmin = serverSupabaseServiceRole(event)

  // Verify that the requestor is an 'owner' of the same tenant
  // First get the target user's profile to find their tenant_id
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', userIdToDelete)
    .single()

  if (!targetProfile) {
    throw createError({ statusCode: 404, statusMessage: 'User profile not found' })
  }

  const { data: requestorProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .eq('tenant_id', targetProfile.tenant_id)
    .single()

  if (!requestorProfile || requestorProfile.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only owners can delete users' })
  }

  // Delete the user from auth.users (this will cascade to profiles)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete)

  if (deleteError) {
    throw createError({ statusCode: 400, statusMessage: deleteError.message })
  }

  return { success: true }
})
