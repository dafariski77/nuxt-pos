<template>
  <div class="group glass-card rounded-2xl overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(213,96,55,0.1)] relative">
    <!-- Category Badge -->
    <span class="absolute top-3 left-3 z-10 text-[10px] font-bold tracking-wider uppercase bg-slate-950/80 backdrop-blur-md text-brand-400 px-2.5 py-1 rounded-full border border-brand-500/20">
      {{ product.category }}
    </span>

    <!-- Product Image Container -->
    <div class="h-44 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="handleImageError"
      />
      <!-- Fallback Gradient -->
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-slate-900 to-brand-950/30 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-slate-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      </div>
    </div>

    <!-- Product Details -->
    <div class="p-4 flex flex-col flex-grow justify-between">
      <div>
        <h3 class="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors duration-200 text-[15px] leading-snug line-clamp-2 min-h-[40px]">
          {{ product.name }}
        </h3>
        <p class="text-[16px] font-bold text-slate-300 mt-1">
          {{ formatRupiah(product.price) }}
        </p>
      </div>

      <!-- Add to Cart Action -->
      <button
        @click="$emit('add-to-cart', product)"
        class="w-full mt-4 bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white font-medium text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Tambah Ke Keranjang
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/stores/cart'

defineProps<{
  product: Product
}>()

defineEmits<{
  (e: 'add-to-cart', product: Product): void
}>()

// Format money to IDR
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

// Fallback in case of image load error
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  // Show a default placeholder or sibling div container
  if (target.parentElement) {
    const fallback = document.createElement('div')
    fallback.className = 'w-full h-full bg-gradient-to-br from-slate-900 to-brand-950/30 flex items-center justify-center absolute inset-0'
    fallback.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-slate-700">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    `
    target.parentElement.appendChild(fallback)
  }
}
</script>
