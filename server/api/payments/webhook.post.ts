import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Verify token (Optional but highly recommended in production)
  const webhookToken = getHeader(event, 'x-callback-token')
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN
  if (expectedToken && webhookToken !== expectedToken) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // Handle QR Payment event
  if (body.event === 'qr.payment' && body.data) {
    const { reference_id, status } = body.data

    if (status === 'COMPLETED') {
      // Use service role to bypass RLS since webhook is unauthenticated by Supabase Auth
      const supabase = serverSupabaseServiceRole(event)
      
      const { error } = await supabase
        .from('transactions')
        .update({ payment_status: 'paid' })
        .eq('id', reference_id)

      if (error) {
        console.error('Webhook Supabase Error:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update transaction' })
      }
    }
  }

  return { success: true }
})
