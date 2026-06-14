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
    error: '',
    isSupabaseActive: false,
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
    async fetchTransactions() {
      this.loading = true
      this.error = ''
      
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
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.transactionsList = data || []
        this.isSupabaseActive = true
      } catch (err: any) {
        console.error('Failed to fetch transactions from Supabase, loading local:', err)
        this.loadLocalTransactions()
        this.isSupabaseActive = false
      } finally {
        this.loading = false
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
