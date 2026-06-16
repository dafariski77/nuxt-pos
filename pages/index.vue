<template>
  <div class="flex h-[calc(100vh-65px)] overflow-hidden">
    <!-- Left: Catalog & Search -->
    <section class="flex-grow flex flex-col h-full overflow-hidden p-6">
      <!-- Search and Filters Bar -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
        <!-- Search input -->
        <div class="relative w-full md:max-w-xs group">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama menu..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all duration-300"
          />
        </div>

        <!-- Category filter buttons -->
        <div class="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            v-for="cat in [{id: 'Semua', name: 'Semua'}, ...categories]"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-300"
            :class="activeCategory === cat.id
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Products Loading State -->
      <div v-if="productsLoading" class="flex-grow flex flex-col items-center justify-center">
        <span class="w-10 h-10 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
        <span class="text-sm font-semibold text-slate-400 mt-4">Memuat katalog produk...</span>
      </div>

      <!-- Catalog Grid -->
      <div v-else class="flex-grow overflow-y-auto pr-1 pb-4">
        <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center text-center p-12 h-64">
          <p class="text-slate-400 font-semibold">Menu tidak ditemukan</p>
          <p class="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang berbeda</p>
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <ProductCard
            v-for="prod in filteredProducts"
            :key="prod.id"
            :product="prod"
            @add-to-cart="cartStore.addToCart"
            class="animate-[fadeIn_0.3s_ease-out]"
          />
        </div>
      </div>
    </section>

    <!-- Right: Cart sidebar -->
    <section class="w-[340px] xl:w-[380px] flex-shrink-0 h-full overflow-hidden border-l border-slate-800/60">
      <CartSidebar @checkout-completed="handleCheckoutSuccess('cash')" @qris-initiated="handleQrisInitiated" />
    </section>

    <!-- QRIS Modal -->
    <Transition name="fade">
      <div v-if="showQrisModal && currentQrisData" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 text-center animate-[scaleUp_0.3s_ease-out]">
          <h2 class="text-xl font-bold text-slate-100 mb-1">Scan untuk Membayar</h2>
          <p class="text-xs text-slate-400 mb-6">Gunakan aplikasi e-Wallet atau Mobile Banking Anda</p>
          
          <div class="bg-white p-4 rounded-2xl mx-auto inline-block border-4 border-slate-800 mb-6">
            <qrcode-vue :value="currentQrisData.qrString" :size="200" level="M" />
          </div>
          
          <div class="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800/50">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
            <p class="text-2xl font-black text-brand-400">{{ formatRupiah(currentQrisData.amount) }}</p>
          </div>
          
          <div class="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 mb-6 bg-slate-800/40 py-2 px-3 rounded-lg w-max mx-auto">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Menunggu pembayaran...
          </div>
          
          <button
            @click="cancelQris"
            class="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all"
          >
            Batal & Kembali
          </button>
        </div>
      </div>
    </Transition>

    <!-- Success Modal Overlay -->
    <Transition name="fade">
      <div v-if="showSuccessModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-[scaleUp_0.3s_ease-out] p-6 text-center">
          <!-- Animated success checkmark -->
          <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 animate-bounce">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <h2 class="text-xl font-bold text-slate-100">Transaksi Sukses!</h2>
          <p class="text-xs text-slate-400 mt-1.5">Struk digital telah tercatat di basis data.</p>

          <!-- Receipt Details -->
          <div class="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 my-5 text-left space-y-2.5">
            <div class="flex justify-between text-xs text-slate-400">
              <span>Waktu Transaksi</span>
              <span class="font-medium text-slate-200">{{ receiptData.time }}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>Metode Pembayaran</span>
              <span class="font-medium text-slate-200 uppercase">{{ receiptData.method === 'qris' ? 'QRIS / XENDIT' : 'KASIR / TUNAI' }}</span>
            </div>
            <div class="border-t border-slate-800/60 pt-2.5 flex justify-between text-sm">
              <span class="font-bold text-slate-300">Total Dibayar</span>
              <span class="font-extrabold text-brand-400">{{ formatRupiah(receiptData.amount) }}</span>
            </div>
          </div>

          <!-- Close Modal button -->
          <button
            @click="closeSuccessModal"
            class="w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            Mulai Transaksi Baru
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import type { Product } from '~/stores/cart'
import QrcodeVue from 'qrcode.vue'

const cartStore = useCartStore()

// State
const products = ref<Product[]>([])
const productsLoading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('Semua')
const showSuccessModal = ref(false)
const showQrisModal = ref(false)
const currentQrisData = ref<any>(null)
let realtimeChannel: any = null

// Receipt Data for success modal
const receiptData = ref({ amount: 0, time: '', method: 'cash' })

const categories = ref<any[]>([])

// Local dummy fallback products removed
const mockProducts: Product[] = []

onMounted(() => { fetchProducts() })
onUnmounted(() => {
  if (realtimeChannel) {
    useSupabaseClient().removeChannel(realtimeChannel)
  }
})

// Fetch products from database
const fetchProducts = async () => {
  productsLoading.value = true
  try {
    const config = useRuntimeConfig()
    const isSupabaseConfigured = config.public.supabase?.url && config.public.supabase?.key

    if (!isSupabaseConfigured) {
      products.value = []
      return
    }

    const supabase = useSupabaseClient()
    
    // Fetch categories first
    const { data: cats } = await supabase.from('categories').select('*')
    if (cats) categories.value = cats

    // Then fetch products
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) throw error

    products.value = data || []
  } catch {
    products.value = []
  } finally {
    productsLoading.value = false
  }
}

const filteredProducts = computed(() =>
  products.value.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat = activeCategory.value === 'Semua' || p.category_id === activeCategory.value
    return matchSearch && matchCat
  })
)

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const handleCheckoutSuccess = (method: 'cash' | 'qris' = 'cash', total?: number) => {
  const amount = total || (cartStore.totalAmount + Math.round(cartStore.totalAmount * 0.1))
  receiptData.value = {
    amount,
    time: new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()),
    method
  }
  showQrisModal.value = false
  showSuccessModal.value = true
}

const handleQrisInitiated = (data: any) => {
  currentQrisData.value = data
  showQrisModal.value = true
  
  // Listen for realtime updates from Supabase
  const supabase = useSupabaseClient()
  realtimeChannel = supabase.channel(`transaction-${data.transactionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `id=eq.${data.transactionId}`
      },
      (payload) => {
        if (payload.new.payment_status === 'paid') {
          cartStore.clearCart() // Clear cart immediately
          handleCheckoutSuccess('qris', data.amount)
        }
      }
    )
    .subscribe()
}

const cancelQris = () => {
  showQrisModal.value = false
  currentQrisData.value = null
  if (realtimeChannel) {
    useSupabaseClient().removeChannel(realtimeChannel)
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  cartStore.resetCheckoutState()
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
