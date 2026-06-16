import { defineStore } from 'pinia'

export interface PaymentMethodConfig {
  id: string
  code: string
  name: string
  provider: string | null
  fee_type: 'percentage' | 'fixed'
  fee_amount: number
  is_active: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    paymentMethods: [] as PaymentMethodConfig[],
    tenantServiceFee: 10,  // Default 10%, diupdate dari DB
    isLoaded: false
  }),

  actions: {
    async fetchSettings() {
      if (this.isLoaded) return

      try {
        const supabase = useSupabaseClient()
        const config = useRuntimeConfig()

        if (!config.public.supabase?.url) {
          this.isLoaded = true
          return
        }

        // Fetch payment methods
        const { data: methods } = await supabase
          .from('payment_methods_config')
          .select('*')
          .eq('is_active', true)

        if (methods) this.paymentMethods = methods as PaymentMethodConfig[]

        // Fetch tenant service_fee langsung dari client (tidak butuh API server)
        // RLS memastikan user hanya bisa baca tenant-nya sendiri
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single()

          if (profile?.tenant_id) {
            const { data: tenant } = await supabase
              .from('tenants')
              .select('service_fee')
              .eq('id', profile.tenant_id)
              .single()

            if (tenant) this.tenantServiceFee = tenant.service_fee ?? 10
          }
        }

        this.isLoaded = true
      } catch (err) {
        console.error('Failed to fetch settings:', err)
        this.isLoaded = true  // tetap set agar tidak retry terus
      }
    }
  }
})
