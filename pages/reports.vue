<template>
  <div class="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-65px)]">
    <!-- Loading State -->
    <div v-if="transactionsStore.loading" class="flex flex-col items-center justify-center h-64">
      <span class="w-10 h-10 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
      <span class="text-sm font-semibold text-slate-400 mt-4">Memuat data transaksi...</span>
      <span class="text-xs text-slate-600 mt-1">Mohon tunggu, maksimal 10 detik</span>
    </div>

    <!-- Error State -->
    <div v-else-if="transactionsStore.error && !transactionsStore.isSupabaseActive" class="flex flex-col items-center justify-center h-64 gap-4">
      <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <div class="text-center">
        <p class="text-sm font-bold text-slate-300">Gagal memuat data</p>
        <p class="text-xs text-slate-500 mt-1">{{ transactionsStore.error }}</p>
      </div>
      <button
        @click="transactionsStore.fetchTransactions(true)"
        class="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all active:scale-95"
      >
        Coba Lagi
      </button>
    </div>

    <div v-else class="space-y-6">
      <!-- KPI Dashboard Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Revenue Card -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-brand-500 relative overflow-hidden flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
          <span class="text-2xl font-black text-slate-100 mt-3 truncate">{{ formatRupiah(transactionsStore.totalRevenue) }}</span>
          <div class="absolute -right-2 -bottom-2 text-slate-900/40 w-16 h-16 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5 0v3.75m0 0h-.75a.75.75 0 0 1-.75-.75V12m1.5 0v3.75m0 0h-.75a.75.75 0 0 1-.75-.75V15.75m1.5 0v3.75a.75.75 0 0 1-.75.75h-.75m-1.5-16.5a1.5 1.5 0 0 0-1.5 1.5v15a1.5 1.5 0 0 0 1.5 1.5M3 16.5h13.5M3 12h13.5M3 7.5h10.5" />
            </svg>
          </div>
        </div>

        <!-- Total Transactions Card -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-sky-500 relative overflow-hidden flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Transaksi</span>
          <span class="text-2xl font-black text-slate-100 mt-3">{{ transactionsStore.totalCount }} Transaksi</span>
          <div class="absolute -right-2 -bottom-2 text-slate-900/40 w-16 h-16 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H9.75m0 18.75h-2.125a3.375 3.375 0 0 1-3.375-3.375V4.625A3.375 3.375 0 0 1 7.625 1.25h3.375c.9 0 1.762.356 2.4 1l4.9 4.9c.65.64 1 1.5 1 2.4v8.25a3.375 3.375 0 0 1-3.375 3.375H9.75Zm4.875-4.875h-3.75m3.75-3H10.5m3.75-3H10.5m-3 9h.008v.008H7.5v-.008Zm0-3h.008v.008H7.5v-.008Zm0-3h.008v.008H7.5V9.75Zm0-3h.008v.008H7.5V6.75Z" />
            </svg>
          </div>
        </div>

        <!-- Average Order Value (AOV) Card -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-rata Transaksi</span>
          <span class="text-2xl font-black text-slate-100 mt-3 truncate">{{ formatRupiah(transactionsStore.averageOrderValue) }}</span>
          <div class="absolute -right-2 -bottom-2 text-slate-900/40 w-16 h-16 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
        </div>

        <!-- Items Sold Card -->
        <div class="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500 relative overflow-hidden flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Item Terjual</span>
          <span class="text-2xl font-black text-slate-100 mt-3">{{ transactionsStore.totalItemsSold }} Pcs</span>
          <div class="absolute -right-2 -bottom-2 text-slate-900/40 w-16 h-16 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Controls & Search -->
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <!-- Search input -->
        <div class="relative w-full sm:max-w-xs group">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari ID / nama menu..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all duration-300"
          />
        </div>

        <!-- Clear local database (visible in local mode) -->
        <button
          v-if="!transactionsStore.isSupabaseActive && transactionsStore.totalCount > 0"
          @click="clearHistory"
          class="text-xs text-red-400 hover:text-white border border-red-500/20 hover:bg-red-600 px-4 py-2.5 rounded-xl transition-all font-semibold active:scale-95 w-full sm:w-auto"
        >
          Hapus Riwayat Lokal
        </button>

        <!-- Refresh button -->
        <button
          v-if="transactionsStore.isSupabaseActive"
          @click="transactionsStore.fetchTransactions(true)"
          :disabled="transactionsStore.loading"
          class="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all font-semibold active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5" :class="transactionsStore.loading ? 'animate-spin' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Perbarui Data
        </button>
      </div>

      <!-- Transactions History Table -->
      <div class="glass-panel rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th class="p-4 pl-6">ID Transaksi</th>
                <th class="p-4">Tanggal & Waktu</th>
                <th class="p-4">Item Terjual</th>
                <th class="p-4">Total Belanja</th>
                <th class="p-4 text-center pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500 text-sm font-medium">
                  Belum ada riwayat transaksi yang cocok.
                </td>
              </tr>
              <tr
                v-for="tx in filteredTransactions"
                :key="tx.id"
                class="hover:bg-slate-900/30 transition-colors text-sm text-slate-300"
              >
                <td class="p-4 pl-6 font-mono text-xs text-brand-400 font-bold">{{ formatId(tx.id) }}</td>
                <td class="p-4 font-medium">{{ formatDate(tx.created_at) }}</td>
                <td class="p-4 max-w-xs truncate font-medium text-xs text-slate-400">{{ formatItemsSummary(tx.items) }}</td>
                <td class="p-4 font-bold text-slate-200">{{ formatRupiah(tx.total_amount) }}</td>
                <td class="p-4 text-center pr-6">
                  <button
                    @click="viewInvoice(tx)"
                    class="text-xs font-bold text-slate-400 hover:text-brand-400 bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all active:scale-95"
                  >
                    Lihat Struk
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detailed Invoice Modal Overlay -->
    <Transition name="fade">
      <div v-if="showInvoiceModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-[scaleUp_0.3s_ease-out] relative">
          <!-- Close Button -->
          <button
            @click="showInvoiceModal = false"
            class="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Receipt Content -->
          <div class="p-6">
            <!-- Header Paper Logo -->
            <div class="text-center pb-5 border-b border-dashed border-slate-800">
              <div class="w-10 h-10 bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center justify-center mx-auto text-brand-400 font-extrabold text-lg mb-2">
                G
              </div>
              <h3 class="font-extrabold text-slate-100 tracking-tight">INVOICE PENJUALAN</h3>
              <p class="text-[10px] text-slate-400 font-mono mt-1">NO: {{ selectedInvoice.id }}</p>
            </div>

            <!-- Receipt Metadata -->
            <div class="py-4 space-y-2 text-xs border-b border-dashed border-slate-800 text-slate-400">
              <div class="flex justify-between">
                <span>Tanggal</span>
                <span class="font-medium text-slate-200">{{ formatDate(selectedInvoice.created_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Kasir / Status</span>
                <span class="font-bold text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Lunas
                </span>
              </div>
            </div>

            <!-- Invoice Item Breakdown -->
            <div class="py-4 border-b border-dashed border-slate-800 space-y-3.5 max-h-48 overflow-y-auto pr-1">
              <div v-for="item in selectedInvoice.items" :key="item.id" class="flex justify-between text-xs">
                <div class="min-w-0">
                  <p class="font-semibold text-slate-200 truncate">{{ item.name }}</p>
                  <p class="text-[10px] text-slate-500 font-medium mt-0.5">{{ item.qty }}x @ {{ formatRupiah(item.price) }}</p>
                </div>
                <span class="font-bold text-slate-300 self-end">{{ formatRupiah(item.price * item.qty) }}</span>
              </div>
            </div>

            <!-- Bill totals -->
            <div class="pt-4 space-y-2 text-xs text-slate-400">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-medium text-slate-200">{{ formatRupiah(invoiceSubtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Pajak & Layanan (10%)</span>
                <span class="font-medium text-slate-200">{{ formatRupiah(invoiceTax) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-800/80 pt-3 text-sm">
                <span class="font-extrabold text-slate-200">Total Akhir</span>
                <span class="font-black text-brand-400 text-base">{{ formatRupiah(selectedInvoice.total_amount) }}</span>
              </div>
            </div>

            <!-- Simulated Print Action -->
            <button
              @click="printInvoice"
              class="w-full mt-6 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h-11.32m12.485-6.662 9.24-7.13a60.07 60.07 0 0 1-16.536 0l9.24 7.13Z" />
              </svg>
              Simulasikan Print Struk
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransactionsStore } from '~/stores/transactions'
import type { Transaction } from '~/stores/transactions'

const transactionsStore = useTransactionsStore()

const searchQuery = ref('')
const showInvoiceModal = ref(false)
const selectedInvoice = ref<Transaction>({ id: '', total_amount: 0, items: [], created_at: '' })

onMounted(() => { transactionsStore.fetchTransactions() })

const invoiceTax = computed(() => {
  const grand = Number(selectedInvoice.value?.total_amount || 0)
  return grand - Math.round(grand / 1.1)
})

const invoiceSubtotal = computed(() => Math.round(Number(selectedInvoice.value?.total_amount || 0) / 1.1))

const formatId = (id: string) => {
  if (!id) return ''
  if (id.startsWith('tx-') || id.startsWith('TX-')) return id
  return 'TX-' + id.substring(0, 7).toUpperCase()
}

const formatDate = (d: string) => {
  if (!d) return ''
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
}

const formatItemsSummary = (items: any[]) => {
  if (!items || items.length === 0) return '-'
  return items.map(i => `${i.name} (x${i.qty})`).join(', ')
}

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const filteredTransactions = computed(() =>
  transactionsStore.transactionsList.filter(tx => {
    const idMatch = tx.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const itemMatch = tx.items?.some(i => i.name.toLowerCase().includes(searchQuery.value.toLowerCase())) || false
    return idMatch || itemMatch
  })
)

const viewInvoice = (tx: Transaction) => {
  selectedInvoice.value = tx
  showInvoiceModal.value = true
}

const printInvoice = () => {
  alert('Printer tidak terdeteksi. Simulasi cetak struk: ' + formatId(selectedInvoice.value.id) + ' berhasil dikirim ke antrean print.')
}

const clearHistory = () => {
  if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat transaksi lokal? Tindakan ini tidak bisa dibatalkan.')) {
    transactionsStore.clearLocalTransactions()
  }
}
</script>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
