import { defineStore } from 'pinia'
import { useCartStore } from './cart'

export interface UserSession {
  email: string
  role?: string
  storeName?: string
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
        this.isSupabaseAuth = false
        this.loadLocalSession()
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
          }
          // Fetch tenant name only on client to avoid SSR context loss
          if (typeof window !== 'undefined') {
            const { data } = await supabase.from('profiles').select('tenants(name)').eq('user_id', session.user.id).single()
            if (data && data.tenants) {
              this.user.storeName = (data.tenants as any).name
            }
          }
        } else {
          this.user = null
        }

        // Subscribe to auth updates only on client
        if (typeof window !== 'undefined') {
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              this.user = {
                email: session.user.email || '',
              }
              const { data } = await supabase.from('profiles').select('tenants(name)').eq('user_id', session.user.id).single()
              if (data && data.tenants) {
                this.user.storeName = (data.tenants as any).name
              }
            } else {
              this.user = null
            }
          })
        }
      } catch (err: any) {
        console.error('Supabase auth initialization failed:', err)
        this.loadLocalSession()
        this.isSupabaseAuth = false
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
        if (!this.isSupabaseAuth) {
          // Local Demo Mode auth
          await new Promise((resolve) => setTimeout(resolve, 800)) // simulated API delay
          
          // Check custom local users database
          const localUsersRaw = localStorage.getItem('gravity_pos_users_db')
          let localUsers: Record<string, string> = {
            'kasir@gravity.pos': 'kasir123',
            'kasir': 'kasir123'
          }
          if (localUsersRaw) {
            try {
              localUsers = { ...localUsers, ...JSON.parse(localUsersRaw) }
            } catch (e) {}
          }

          if (localUsers[email] && localUsers[email] === pass) {
            const sessionUser = { 
              email: email.includes('@') ? email : `${email}@gravity.pos`,
              storeName: 'Demo Store'
            }
            this.user = sessionUser
            localStorage.setItem('gravity_pos_session', JSON.stringify(sessionUser))
            return true
          } else {
            throw new Error('Email/Username atau password salah.')
          }
        }

        const supabase = useSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
        })

        if (error) throw error

        if (data.user) {
          this.user = { email: data.user.email || '' }
          // Fetch tenant name
          const { data: profile } = await supabase.from('profiles').select('tenants(name)').eq('user_id', data.user.id).single()
          if (profile && profile.tenants) {
            this.user.storeName = (profile.tenants as any).name
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
        if (!this.isSupabaseAuth) {
          // Local Demo Mode signup
          await new Promise((resolve) => setTimeout(resolve, 800))
          
          const localUsersRaw = localStorage.getItem('gravity_pos_users_db')
          let localUsers: Record<string, string> = {}
          if (localUsersRaw) {
            try {
              localUsers = JSON.parse(localUsersRaw)
            } catch (e) {}
          }

          if (localUsers[email] || email === 'kasir' || email === 'kasir@gravity.pos') {
            throw new Error('Username / Email sudah terdaftar.')
          }

          localUsers[email] = pass
          localStorage.setItem('gravity_pos_users_db', JSON.stringify(localUsers))
          
          // Auto login after signup in local mode
          const sessionUser = { 
            email: email.includes('@') ? email : `${email}@gravity.pos`,
            storeName: storeName
          }
          this.user = sessionUser
          localStorage.setItem('gravity_pos_session', JSON.stringify(sessionUser))
          return true
        }

        const supabase = useSupabaseClient<any>()
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass
        })

        if (error) throw error

        if (data.user) {
          // Create tenant and profile
          const { error: rpcError } = await supabase.rpc('create_tenant', { store_name: storeName })
          if (rpcError) {
            console.error('Tenant creation error:', rpcError)
            // If tenant creation fails, we might want to let the user know, but they are already signed up.
            // Ideally we'd rollback auth, but Supabase doesn't support that easily.
            throw new Error('Akun terdaftar, tetapi gagal membuat toko: ' + rpcError.message)
          }

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
