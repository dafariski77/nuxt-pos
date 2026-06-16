import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { items } = body

  // Client (user session) untuk operasi yang butuh RLS
  const supabase = await serverSupabaseClient(event)
  // Service role untuk query yang perlu bypass RLS (ambil tenant_id dari profiles)
  const adminSupabase = serverSupabaseServiceRole(event)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // 1. Ambil profile user dengan service role (bypass RLS)
  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', user.id)  // profiles menggunakan kolom user_id, bukan id
    .single()

  if (profileError || !profile?.tenant_id) {
    throw createError({ statusCode: 403, statusMessage: 'Tenant tidak ditemukan' })
  }

  const tenantId = profile.tenant_id

  // Ambil service_fee dari tenant
  const { data: tenant } = await adminSupabase
    .from('tenants')
    .select('service_fee')
    .eq('id', tenantId)
    .single()

  const serviceFeeRate = tenant?.service_fee ?? 10  // fallback 10%

  // 2. Validasi items dan hitung total dari harga di SERVER (database)
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Items tidak boleh kosong' })
  }

  const productIds = items.map((i: any) => i.id)

  // Gunakan adminSupabase agar tidak terblokir RLS saat query harga produk
  const { data: products, error: productError } = await adminSupabase
    .from('products')
    .select('id, price')
    .in('id', productIds)
    .eq('tenant_id', tenantId)

  if (productError || !products?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Produk tidak valid' })
  }

  // Buat map harga dari DB (server is the source of truth)
  const priceMap = new Map(products.map((p: any) => [p.id, p.price]))

  // Hitung subtotal dari harga DB, bukan dari client
  let subtotal = 0
  for (const item of items) {
    const price = priceMap.get(item.id)
    if (price === undefined) {
      throw createError({ statusCode: 400, statusMessage: `Produk ${item.id} tidak ditemukan di tenant ini` })
    }
    subtotal += price * (item.quantity ?? 1)
  }

  // 3. Ambil payment method config untuk QRIS (fee MDR)
  const { data: qrisConfig } = await adminSupabase
    .from('payment_methods_config')
    .select('fee_type, fee_amount')
    .eq('code', 'qris')
    .eq('is_active', true)
    .single()

  // Hitung pajak dari tenant config
  const tax = Math.round(subtotal * (serviceFeeRate / 100))

  // Hitung fee QRIS jika ada
  let paymentFee = 0
  if (qrisConfig) {
    const base = subtotal + tax
    paymentFee = qrisConfig.fee_type === 'percentage'
      ? Math.round(base * (qrisConfig.fee_amount / 100))
      : Math.round(qrisConfig.fee_amount)
  }

  const totalAmount = subtotal + tax + paymentFee

  // 4. Buat transaksi sebagai pending
  const { data: trx, error: trxError } = await supabase
    .from('transactions')
    .insert({
      tenant_id: tenantId,
      total_amount: totalAmount,
      items: items,
      payment_method: 'qris',
      payment_status: 'pending'
    })
    .select('id')
    .single()

  if (trxError || !trx) {
    console.error('Error creating transaction:', trxError)
    throw createError({ statusCode: 500, statusMessage: 'Gagal membuat transaksi' })
  }

  // 5. Panggil Xendit API dengan amount yang dihitung di server
  const xenditKey = process.env.XENDIT_SECRET_KEY
  if (!xenditKey) {
    throw createError({ statusCode: 500, statusMessage: 'Xendit API Key not configured' })
  }

  try {
    const xenditResponse = await $fetch<any>('https://api.xendit.co/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(xenditKey + ':')}`,
        'Content-Type': 'application/json',
        'api-version': '2022-07-31'
      },
      body: {
        reference_id: trx.id,
        type: 'DYNAMIC',
        currency: 'IDR',
        amount: totalAmount
      }
    })

    // Update transaksi dengan referensi Xendit
    await supabase
      .from('transactions')
      .update({ payment_reference: xenditResponse.id })
      .eq('id', trx.id)

    return {
      transactionId: trx.id,
      qrString: xenditResponse.qr_string,
      amount: totalAmount,
      expiresAt: xenditResponse.expires_at
    }
  } catch (error: any) {
    // Hapus transaksi pending jika Xendit gagal
    await supabase.from('transactions').delete().eq('id', trx.id)

    const xenditError = error.data || error.message
    console.error('Xendit Error Details:', xenditError)

    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal menghubungi Xendit',
      data: xenditError
    })
  }
})
