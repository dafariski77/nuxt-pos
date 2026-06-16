import { defineStore } from 'pinia'

export interface TransactionItem {
  id: string
  name: string
  qty: number
  price: number
}

export interface Transaction {
  id: string
  total_amount: number
  items: TransactionItem[]
  created_at: string
}

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactionsList: [] as Transaction[],
    loading: false,
    isFetching: false,   // guard concurrent fetch
    error: '',
    isSupabaseActive: false,
    lastFetchedAt: 0,
  }),

  getters: {
    totalRevenue(): number {
      return this.transactionsList.reduce((sum, tx) => sum + Number(tx.total_amount), 0)
    },
    totalCount(): number {
      return this.transactionsList.length
    },
    averageOrderValue(): number {
      if (this.totalCount === 0) return 0
      return Math.round(this.totalRevenue / this.totalCount)
    },
    totalItemsSold(): number {
      return this.transactionsList.reduce((sum, tx) => {
        const itemQty = tx.items?.reduce((itemSum, item) => itemSum + (item.qty || 0), 0) || 0
        return sum + itemQty
      }, 0)
    }
  },

  actions: {
    async fetchTransactions(forceRefresh = false) {
      // Guard: jangan jalankan 2 fetch bersamaan
      if (this.isFetching) return

      // Cache: skip jika data fresh & tidak diminta refresh
      const now = Date.now()
      if (!forceRefresh && this.lastFetchedAt > 0 && (now - this.lastFetchedAt) < 60_000) {
        return
      }

      this.isFetching = true
      this.loading = true
      this.error = ''

      // Timeout 10 detik
      const timeoutId = setTimeout(() => {
        if (this.isFetching) {
          console.warn('[Reports] Fetch timeout, falling back to local')
          this.loadLocalTransactions()
          this.isSupabaseActive = false
          this.loading = false
          this.isFetching = false
        }
      }, 10_000)

      try {
        const config = useRuntimeConfig()
        const isSupabaseConfigured = config.public.supabase?.url && config.public.supabase?.key

        if (!isSupabaseConfigured) {
          this.loadLocalTransactions()
          this.isSupabaseActive = false
          return
        }

        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('transactions')
          .select('id, total_amount, items, created_at, payment_method, payment_status')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        this.transactionsList = data || []
        this.isSupabaseActive = true
        this.lastFetchedAt = Date.now()
      } catch (err: any) {
        console.error('[Reports] Fetch failed, loading local:', err.message)
        this.error = err.message || 'Gagal memuat transaksi'
        this.loadLocalTransactions()
        this.isSupabaseActive = false
      } finally {
        clearTimeout(timeoutId)
        this.loading = false
        this.isFetching = false
      }
    },

    loadLocalTransactions() {
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('gravity_pos_transactions')
        if (localData) {
          try {
            this.transactionsList = JSON.parse(localData).sort((a: Transaction, b: Transaction) => {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            })
          } catch (e) {
            console.error('Error parsing local transactions', e)
            this.transactionsList = []
          }
        } else {
          this.transactionsList = []
        }
      }
    },

    saveLocalTransaction(tx: Transaction) {
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('gravity_pos_transactions')
        let currentTxs: Transaction[] = []
        if (localData) {
          try {
            currentTxs = JSON.parse(localData)
          } catch (e) {
            currentTxs = []
          }
        }
        
        currentTxs.push(tx)
        localStorage.setItem('gravity_pos_transactions', JSON.stringify(currentTxs))
        
        // Refresh local list state
        this.loadLocalTransactions()
      }
    },

    clearLocalTransactions() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gravity_pos_transactions')
        this.transactionsList = []
      }
    }
  }
})
