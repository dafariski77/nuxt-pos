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

        const { data, error } = await supabase
          .from('payment_methods_config')
          .select('*')
          .eq('is_active', true)
          
        if (data && !error) {
          this.paymentMethods = data as PaymentMethodConfig[]
          this.isLoaded = true
        }
      } catch (err) {
        console.error('Failed to fetch payment methods config:', err)
      }
    }
  }
})
