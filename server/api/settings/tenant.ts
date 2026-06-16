import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const adminSupabase = serverSupabaseServiceRole(event)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('[Tenant API] Profile error:', profileError.message)
      throw createError({ statusCode: 403, statusMessage: 'Profil tidak ditemukan: ' + profileError.message })
    }

    if (!profile?.tenant_id) {
      throw createError({ statusCode: 403, statusMessage: 'Tenant tidak ditemukan' })
    }

    const method = event.method

    // GET - ambil data tenant
    if (method === 'GET') {
      const { data, error } = await adminSupabase
        .from('tenants')
        .select('id, name, service_fee, created_at')
        .eq('id', profile.tenant_id)
        .single()

      if (error) {
        console.error('[Tenant API] Fetch tenant error:', error.message)
        throw createError({ statusCode: 500, statusMessage: 'Gagal mengambil data toko: ' + error.message })
      }
      return data
    }

    // PUT - hanya owner
    if (method === 'PUT') {
      if (profile.role !== 'owner') {
        throw createError({ statusCode: 403, statusMessage: 'Hanya owner yang bisa mengubah pengaturan toko' })
      }

      const body = await readBody(event)
      const { name, service_fee } = body

      if (!name?.trim()) throw createError({ statusCode: 400, statusMessage: 'Nama toko tidak boleh kosong' })
      if (service_fee === undefined || service_fee < 0 || service_fee > 100) {
        throw createError({ statusCode: 400, statusMessage: 'Biaya layanan harus antara 0-100%' })
      }

      const { data, error } = await adminSupabase
        .from('tenants')
        .update({ name: name.trim(), service_fee: Number(service_fee) })
        .eq('id', profile.tenant_id)
        .select('id, name, service_fee')
        .single()

      if (error) throw createError({ statusCode: 500, statusMessage: 'Gagal memperbarui data toko' })
      return data
    }

    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  } catch (err: any) {
    // Re-throw H3 errors as-is
    if (err.statusCode) throw err
    // Log dan wrap unknown errors
    console.error('[Tenant API] Unhandled error:', err)
    throw createError({ statusCode: 500, statusMessage: err.message || 'Server Error' })
  }
})
