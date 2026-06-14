import { defineStore } from 'pinia'

export interface UserSession {
  email: string
  role?: string
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
        } else {
          this.user = null
        }

        // Subscribe to auth updates
        supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            this.user = {
              email: session.user.email || '',
            }
          } else {
            this.user = null
          }
        })
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
            const sessionUser = { email: email.includes('@') ? email : `${email}@gravity.pos` }
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

    async signUp(email: string, pass: string) {
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
          const sessionUser = { email: email.includes('@') ? email : `${email}@gravity.pos` }
          this.user = sessionUser
          localStorage.setItem('gravity_pos_session', JSON.stringify(sessionUser))
          return true
        }

        const supabase = useSupabaseClient()
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass
        })

        if (error) throw error

        if (data.user) {
          this.user = { email: data.user.email || '' }
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
        this.loading = false
      }
    }
  }
})
