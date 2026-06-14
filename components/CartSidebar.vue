<template>
  <div class="h-full flex flex-col justify-between glass-panel rounded-2xl p-6 relative overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-brand-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <h2 class="text-[17px] font-bold text-slate-100">Detail Pesanan</h2>
      </div>
      <!-- Clear Cart Badge -->
      <button
        v-if="cartStore.cartItems.length > 0"
        @click="cartStore.clearCart()"
        class="text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all"
      >
        Kosongkan
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="cartStore.cartItems.length === 0"
      class="flex-grow flex flex-col items-center justify-center text-center p-6"
    >
      <div class="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 mb-4 text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-400">Keranjang masih kosong</p>
      <p class="text-xs text-slate-500 mt-1 max-w-[200px]">Pilih menu di katalog sebelah kiri untuk mulai memesan</p>
    </div>

    <!-- Items List -->
    <div v-else class="flex-grow overflow-y-auto py-4 space-y-4 pr-1">
      <div
        v-for="item in cartStore.cartItems"
        :key="item.product.id"
        class="flex items-center gap-3 bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl hover:border-slate-700/60 transition-colors"
      >
        <img
          v-if="item.product.image_url"
          :src="item.product.image_url"
          :alt="item.product.name"
          class="w-12 h-12 object-cover rounded-lg bg-slate-950"
        />
        <div class="flex-grow min-w-0">
          <h4 class="text-sm font-semibold text-slate-200 truncate">{{ item.product.name }}</h4>
          <p class="text-xs font-medium text-slate-400 mt-0.5">
            {{ formatRupiah(item.product.price) }}
          </p>
        </div>
        
        <!-- Quantity Actions -->
        <div class="flex items-center gap-2">
          <!-- Decrement -->
          <button
            @click="cartStore.updateQty(item.product.id, item.qty - 1)"
            class="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
          </button>
          
          <!-- Qty Value -->
          <span class="text-sm font-bold text-slate-200 w-6 text-center">{{ item.qty }}</span>
          
          <!-- Increment -->
          <button
            @click="cartStore.updateQty(item.product.id, item.qty + 1)"
            class="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          
          <!-- Remove -->
          <button
            @click="cartStore.removeFromCart(item.product.id)"
            class="w-7 h-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-all ml-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Order Summary & Checkout -->
    <div v-if="cartStore.cartItems.length > 0" class="border-t border-slate-800 pt-4 mt-auto space-y-4">
      <div class="space-y-2.5">
        <div class="flex justify-between text-sm">
          <span class="text-slate-400">Subtotal</span>
          <span class="font-medium text-slate-200">{{ formatRupiah(cartStore.totalAmount) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-400">Pajak & Layanan (10%)</span>
          <span class="font-medium text-slate-200">{{ formatRupiah(taxAndService) }}</span>
        </div>
        <div class="flex justify-between border-t border-slate-800/80 pt-3">
          <span class="text-sm font-bold text-slate-200">Total Tagihan</span>
          <span class="text-base font-extrabold text-brand-400">{{ formatRupiah(grandTotal) }}</span>
        </div>
      </div>

      <!-- Checkout Button -->
      <button
        @click="handleCheckout"
        :disabled="cartStore.checkoutLoading"
        class="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98]"
      >
        <span v-if="cartStore.checkoutLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
        {{ cartStore.checkoutLoading ? 'Memproses...' : 'Proses Bayar' }}
      </button>

      <!-- Error Toast -->
      <div
        v-if="cartStore.errorMessage"
        class="text-xs bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg flex items-start gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mt-0.5 shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008h-.008v-.008Z" />
        </svg>
        <span>{{ cartStore.errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

// Tax and Service calculations (10%)
const taxAndService = computed(() => {
  return Math.round(cartStore.totalAmount * 0.1)
})

const grandTotal = computed(() => {
  return cartStore.totalAmount + taxAndService.value
})

// Format money to IDR
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const emit = defineEmits<{
  (e: 'checkout-completed'): void
}>()

// Handle triggering checkout
const handleCheckout = async () => {
  await cartStore.checkout()
  if (cartStore.checkoutSuccess) {
    emit('checkout-completed')
  }
}
</script>
