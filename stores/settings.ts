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

        // Fetch tenant service_fee
        const tenantData = await $fetch<{ service_fee: number }>('/api/settings/tenant').catch(() => null)
        if (tenantData) this.tenantServiceFee = tenantData.service_fee

        this.isLoaded = true
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
  }
})
