<template>
  <div class="h-full overflow-y-auto bg-slate-950 p-6 md:p-8">
    <div class="max-w-2xl mx-auto space-y-8">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Pengaturan Toko</h1>
        <p class="text-slate-400 text-sm mt-1">Kelola informasi dan biaya layanan toko Anda</p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-4">
        <div class="h-10 rounded-xl bg-slate-800 animate-pulse"></div>
        <div class="h-10 rounded-xl bg-slate-800 animate-pulse w-2/3"></div>
      </div>

      <!-- Form Card -->
      <div v-else class="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">

        <!-- Nama Toko -->
        <div class="p-6 space-y-3">
          <label class="block text-sm font-semibold text-slate-300">Nama Toko</label>
          <p class="text-xs text-slate-500">Nama toko yang akan muncul di struk dan tampilan kasir.</p>
          <input
            v-model="form.name"
            type="text"
            placeholder="Masukkan nama toko..."
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        <!-- Biaya Layanan -->
        <div class="p-6 space-y-3">
          <label class="block text-sm font-semibold text-slate-300">Biaya Pajak & Layanan</label>
          <p class="text-xs text-slate-500">
            Persentase biaya yang ditambahkan ke setiap transaksi. Contoh: <code class="text-brand-400">10</code> = 10%.
            Masukkan <code class="text-brand-400">0</code> jika tidak dikenakan biaya.
          </p>
          <div class="relative">
            <input
              v-model.number="form.service_fee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="10"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">%</span>
          </div>
          <!-- Preview -->
          <div class="bg-slate-800/60 rounded-xl p-4 space-y-2 text-sm">
            <p class="text-slate-400 font-medium mb-2">Contoh perhitungan</p>
            <div class="flex justify-between text-slate-400">
              <span>Subtotal pesanan</span>
              <span>Rp 100.000</span>
            </div>
            <div class="flex justify-between text-slate-300">
              <span>Biaya Layanan ({{ form.service_fee }}%)</span>
              <span>+ {{ formatRupiah(Math.round(100000 * form.service_fee / 100)) }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-700 pt-2 font-bold text-white">
              <span>Total Tagihan</span>
              <span class="text-brand-400">{{ formatRupiah(100000 + Math.round(100000 * form.service_fee / 100)) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 flex items-center justify-between gap-4">
          <!-- Success message -->
          <transition name="fade">
            <div v-if="saveSuccess" class="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Perubahan berhasil disimpan!
            </div>
            <div v-else-if="saveError" class="flex items-center gap-2 text-red-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H-.008v-.008Z" />
              </svg>
              {{ saveError }}
            </div>
            <div v-else class="text-slate-500 text-sm">Belum ada perubahan disimpan.</div>
          </transition>

          <button
            @click="saveTenant"
            :disabled="saving"
            class="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
          >
            <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

const form = ref({
  name: '',
  service_fee: 10
})

const formatRupiah = (val: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

onMounted(async () => {
  try {
    const data = await $fetch<{ name: string; service_fee: number }>('/api/settings/tenant')
    form.value.name = data.name
    form.value.service_fee = data.service_fee
  } catch (err: any) {
    saveError.value = err.statusMessage || 'Gagal memuat data toko'
  } finally {
    loading.value = false
  }
})

const saveTenant = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    await $fetch('/api/settings/tenant', {
      method: 'PUT',
      body: { name: form.value.name, service_fee: form.value.service_fee }
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = err.data?.statusMessage || err.statusMessage || 'Gagal menyimpan perubahan'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
