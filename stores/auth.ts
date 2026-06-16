import { defineStore } from 'pinia'
import { useCartStore } from './cart'

export interface UserSession {
  email: string
  role?: string
  storeName?: string
  tenantId?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserSession | null,
    loading: false,
    error: '',
    isSupabaseAuth: false,
  }),

  getters: {
    isAuthenticated(): boolean {
      return this.user !== null
    },
    userEmail(): string {
      return this.user?.email || ''
    }
  },

  actions: {
    async initializeAuth() {
      const config = useRuntimeConfig()
      const isSupabaseConfigured = config.public.supabase?.url && config.public.supabase?.key

      if (!isSupabaseConfigured) {
        console.error('Supabase configuration is missing. Cannot initialize auth.')
        return
      }

      this.isSupabaseAuth = true
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          this.user = {
            email: session.user.email || '',
            role: undefined,
            storeName: undefined,
            tenantId: undefined
          }
          // Fetch role first without JOIN
          const { data, error } = await supabase.from('profiles').select('role, tenant_id').eq('user_id', session.user.id).single()
          if (error) {
            console.error('Error fetching profile in initializeAuth:', error)
          }
          if (data) {
            this.user.role = data.role
            if (data.tenant_id) {
              this.user.tenantId = data.tenant_id
              // Fetch tenant separately
              const { data: tenantData } = await supabase.from('tenants').select('name').eq('id', data.tenant_id).single()
              if (tenantData) {
                this.user.storeName = tenantData.name
              }
            }
          }
        } else {
          this.user = null
        }

        // Subscribe to auth updates only on client
        if (typeof window !== 'undefined') {
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              if (!this.user) {
                this.user = {
                  email: session.user.email || '',
                  role: undefined,
                  storeName: undefined,
                  tenantId: undefined
                }
              } else {
                this.user.email = session.user.email || ''
              }
              const { data, error } = await supabase.from('profiles').select('role, tenant_id').eq('user_id', session.user.id).single()
          if (error) {
            console.error('Error fetching profile in initializeAuth:', error)
          }
              if (data) {
                this.user.role = data.role
                if (data.tenant_id) {
                  this.user.tenantId = data.tenant_id
                  const { data: tenantData } = await supabase.from('tenants').select('name').eq('id', data.tenant_id).single()
                  if (tenantData) {
                    this.user.storeName = tenantData.name
                  }
                }
              }
            } else {
              this.user = null
            }
          })
        }
      } catch (err: any) {
        console.error('Supabase auth initialization failed:', err)
      } finally {
        this.loading = false
      }
    },

    loadLocalSession() {
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('gravity_pos_session')
        if (session) {
          try {
            this.user = JSON.parse(session)
          } catch (e) {
            this.user = null
          }
        } else {
          this.user = null
        }
      }
    },

    async login(email: string, pass: string) {
      this.loading = true
      this.error = ''

      try {

        const supabase = useSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
        })

        if (error) throw error

        if (data.user) {
          this.user = { 
            email: data.user.email || '',
            role: undefined,
            storeName: undefined,
            tenantId: undefined
          }
          // Fetch role first without JOIN
          const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('user_id', data.user.id).single()
          if (profile) {
            this.user.role = profile.role
            if (profile.tenant_id) {
              this.user.tenantId = profile.tenant_id
              const { data: tenantData } = await supabase.from('tenants').select('name').eq('id', profile.tenant_id).single()
              if (tenantData) {
                this.user.storeName = tenantData.name
              }
            }
          }
          return true
        }
      } catch (err: any) {
        console.error('Login error:', err)
        this.error = err.message || 'Gagal login. Periksa koneksi Anda.'
        return false
      } finally {
        this.loading = false
      }
    },

    async signUp(email: string, pass: string, storeName: string = 'Demo Store') {
      this.loading = true
      this.error = ''

      try {

        const supabase = useSupabaseClient<any>()
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              store_name: storeName
            }
          }
        })

        if (error) throw error

        if (data.user) {
          this.user = { 
            email: data.user.email || '',
            storeName: storeName 
          }
          return true
        }
      } catch (err: any) {
        console.error('Signup error:', err)
        this.error = err.message || 'Gagal mendaftar. Periksa koneksi Anda.'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        if (this.isSupabaseAuth) {
          const supabase = useSupabaseClient()
          await supabase.auth.signOut()
        }
      } catch (err) {
        console.error('Supabase logout error:', err)
      } finally {
        this.user = null
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gravity_pos_session')
        }
        
        // Clear cart data
        const cartStore = useCartStore()
        cartStore.clearCart()
        
        this.loading = false
      }
    }
  }
})
