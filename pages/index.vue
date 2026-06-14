<template>
  <div class="flex-grow flex flex-col min-h-screen">
    <!-- Header -->
    <header class="glass-panel border-t-0 border-x-0 rounded-none px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <!-- Logo Icon -->
        <div class="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-black text-xl tracking-tighter">
          G
        </div>
        <div>
          <h1 class="text-[16px] font-black tracking-tight text-slate-100 flex items-center gap-1.5 leading-none">
            GravityPOS <span class="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md border border-brand-500/20">MVP</span>
          </h1>
          <p class="text-[11px] text-slate-400 mt-1 font-medium">{{ currentTimeString }}</p>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex items-center gap-1 bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl">
        <NuxtLink
          to="/"
          class="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-brand-400 border border-slate-700/50"
        >
          Katalog Kasir
        </NuxtLink>
        <NuxtLink
          to="/reports"
          class="px-4 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-slate-200 transition-all"
        >
          Laporan Penjualan
        </NuxtLink>
      </nav>

      <!-- Cashier info & Logout -->
      <div class="flex items-center gap-4">
        <!-- Connection Status indicator -->
        <div class="hidden md:flex items-center gap-2">
          <span
            class="w-2.5 h-2.5 rounded-full animate-pulse"
            :class="isSupabaseConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'"
          ></span>
          <span class="text-[11px] font-semibold text-slate-400">
            {{ isSupabaseConnected ? 'Supabase' : 'Offline' }}
          </span>
        </div>

        <!-- Cashier name & icon -->
        <div class="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl">
          <div class="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-black uppercase">
            {{ authStore.userEmail.charAt(0) }}
          </div>
          <span class="text-xs font-bold text-slate-300 max-w-[90px] truncate">
            {{ authStore.userEmail.split('@')[0] }}
          </span>
        </div>

        <!-- Logout button -->
        <button
          @click="handleLogout"
          class="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 flex items-center justify-center transition-all active:scale-95"
          title="Keluar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden max-h-[calc(100vh-73px)]">
      <!-- Left: Catalog & Search (8 cols) -->
      <section class="lg:col-span-8 flex flex-col h-full overflow-hidden">
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
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
              class="px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-300"
              :class="activeCategory === cat 
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
            >
              {{ cat }}
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

      <!-- Right: Cart panel (4 cols) -->
      <section class="lg:col-span-4 h-full overflow-hidden">
        <CartSidebar @checkout-completed="handleCheckoutSuccess" />
      </section>
    </main>

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
              <span class="font-medium text-slate-200">KASIR / TUNAI</span>
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
import { useAuthStore } from '~/stores/auth'
import type { Product } from '~/stores/cart'

const cartStore = useCartStore()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}

// State
const products = ref<Product[]>([])
const productsLoading = ref(true)
const isSupabaseConnected = ref(false)
const searchQuery = ref('')
const activeCategory = ref('Semua')
const showSuccessModal = ref(false)
const currentTime = ref(new Date())

// Receipt Data for success modal
const receiptData = ref({
  amount: 0,
  time: ''
})

const categories = ['Semua', 'Kopi', 'Non-Kopi', 'Makanan']

// Local dummy fallback products (in case Supabase is offline or unconfigured)
const mockProducts: Product[] = [
  { id: '1', name: 'Kopi Susu Aren', price: 18000, category: 'Kopi', image_url: '/images/kopi_susu.png' },
  { id: '2', name: 'Espresso', price: 15000, category: 'Kopi', image_url: '/images/espresso.png' },
  { id: '3', name: 'Caramel Latte', price: 24000, category: 'Kopi', image_url: '/images/caramel_latte.png' },
  { id: '4', name: 'Americano', price: 18000, category: 'Kopi', image_url: '/images/americano.png' },
  { id: '5', name: 'Iced Matcha Latte', price: 22000, category: 'Non-Kopi', image_url: '/images/matcha_latte.png' },
  { id: '6', name: 'Red Velvet Latte', price: 22000, category: 'Non-Kopi', image_url: '/images/red_velvet.png' },
  { id: '7', name: 'Chocolate Signature', price: 20000, category: 'Non-Kopi', image_url: '/images/chocolate.png' },
  { id: '8', name: 'Butter Croissant', price: 18000, category: 'Makanan', image_url: '/images/croissant.png' },
  { id: '9', name: 'Almond Croissant', price: 25000, category: 'Makanan', image_url: '/images/almond_croissant.png' },
  { id: '10', name: 'Fudge Brownie', price: 15000, category: 'Makanan', image_url: '/images/brownie.png' },
]

// Current time updates
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
  
  fetchProducts()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const currentTimeString = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(currentTime.value)
})

// Fetch products from database
const fetchProducts = async () => {
  productsLoading.value = true
  
  try {
    const config = useRuntimeConfig()
    const isSupabaseConfigured = config.public.supabase?.url && config.public.supabase?.key

    if (!isSupabaseConfigured) {
      console.warn('Supabase keys are missing. Loading local demo catalog products.')
      products.value = mockProducts
      isSupabaseConnected.value = false
      return
    }

    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) throw error

    if (data && data.length > 0) {
      products.value = data
      isSupabaseConnected.value = true
    } else {
      console.log('No products found in DB. Falling back to local catalog.')
      products.value = mockProducts
      isSupabaseConnected.value = true
    }
  } catch (error) {
    console.error('Failed to fetch from Supabase. Falling back to mock data:', error)
    products.value = mockProducts
    isSupabaseConnected.value = false
  } finally {
    productsLoading.value = false
  }
}

// Filters logic
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = activeCategory.value === 'Semua' || product.category === activeCategory.value
    return matchesSearch && matchesCategory
  })
})

// Formatting money to IDR
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

// Success Checkout handler
const handleCheckoutSuccess = () => {
  const tax = Math.round(cartStore.totalAmount * 0.1)
  receiptData.value = {
    amount: cartStore.totalAmount + tax,
    time: new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(new Date())
  }
  showSuccessModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  cartStore.resetCheckoutState()
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
