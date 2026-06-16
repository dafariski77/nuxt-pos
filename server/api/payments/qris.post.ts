import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tenantId, totalAmount, items } = body

  // We should extract the auth session to get the user, or rely on the client to send it securely?
  // Let's use the secure server client
  const supabase = await serverSupabaseClient(event)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // 1. Create transaction as pending
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

  // 2. Call Xendit API
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

    // Update the transaction with the Xendit payment reference
    await supabase
      .from('transactions')
      .update({ payment_reference: xenditResponse.id })
      .eq('id', trx.id)

    // Return the generated QR string
    return {
      transactionId: trx.id,
      qrString: xenditResponse.qr_string,
      amount: totalAmount,
      expiresAt: xenditResponse.expires_at
    }
  } catch (error: any) {
    const xenditError = error.data || error.message
    console.error('Xendit Error Details:', xenditError)
    
    // Create a detailed error response
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Gagal menghubungi Xendit',
      data: xenditError
    })
  }
})
