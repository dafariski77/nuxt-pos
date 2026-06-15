<template>
  <div class="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-65px)]">

    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-black text-slate-100 tracking-tight">Daftar Produk</h2>
        <p class="text-xs text-slate-400 mt-0.5">Tambah, ubah, atau hapus produk dari katalog</p>
      </div>
      <button @click="openAddModal" class="btn-primary flex items-center gap-2 self-start sm:self-auto">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Tambah Produk
      </button>
    </div>

    <!-- Stats bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-panel p-4 rounded-2xl">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Produk</p>
        <p class="text-2xl font-black text-slate-100 mt-2">{{ products.length }}</p>
      </div>
      <div v-for="cat in categories.slice(0, 3)" :key="cat.id" class="glass-panel p-4 rounded-2xl">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ cat.name }}</p>
        <p class="text-2xl font-black text-slate-100 mt-2">{{ countByCategory(cat.id) }}</p>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="flex flex-col sm:flex-row gap-3 items-center">
      <div class="relative w-full sm:max-w-xs group">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama produk..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all"
        />
      </div>
      <div class="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
        <button
          v-for="cat in [{id: 'Semua', name: 'Semua'}, ...categories]"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200"
          :class="activeCategory === cat.id
            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <span class="w-10 h-10 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></span>
      <span class="text-sm font-semibold text-slate-400 mt-4">Memuat produk...</span>
    </div>

    <!-- Products Table -->
    <div v-else class="glass-panel rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th class="p-4 pl-6">Produk</th>
              <th class="p-4">Kategori</th>
              <th class="p-4">Harga</th>
              <th class="p-4 text-center pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-if="filteredProducts.length === 0">
              <td colspan="4" class="p-10 text-center">
                <div class="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-slate-700">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <p class="text-slate-500 font-semibold text-sm">Tidak ada produk ditemukan</p>
                  <p class="text-slate-600 text-xs">Coba ubah filter atau kata kunci pencarian</p>
                </div>
              </td>
            </tr>
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-slate-900/30 transition-colors group">
              <td class="p-4 pl-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-500 overflow-hidden flex-shrink-0">
                    <img
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="w-full h-full object-cover rounded-xl"
                      @error="($event.target as HTMLImageElement).style.display = 'none'"
                    />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-200">{{ product.name }}</p>
                    <p class="text-[10px] text-slate-500 font-mono mt-0.5">ID: {{ product.id.substring(0, 8).toUpperCase() }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span :class="categoryBadge(product.category_id)">{{ getCategoryName(product.category_id) }}</span>
              </td>
              <td class="p-4 font-bold text-slate-200 text-sm">{{ formatRupiah(product.price) }}</td>
              <td class="p-4 pr-6">
                <div class="flex items-center gap-2 justify-center">
                  <button
                    @click="openEditModal(product)"
                    class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-brand-500/10 text-slate-400 hover:text-brand-400 border border-slate-700 hover:border-brand-500/30 flex items-center justify-center transition-all active:scale-95"
                    title="Edit produk"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(product)"
                    class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 flex items-center justify-center transition-all active:scale-95"
                    title="Hapus produk"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── Add / Edit Product Modal ─── -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl animate-[scaleUp_0.25s_ease-out] overflow-hidden">

          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h3 class="font-black text-slate-100 text-base">{{ isEditing ? 'Edit Produk' : 'Tambah Produk Baru' }}</h3>
            <button @click="closeModal" class="text-slate-500 hover:text-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Form -->
          <form @submit.prevent="saveProduct" class="p-6 space-y-4">

            <!-- Nama Produk -->
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1.5">Nama Produk <span class="text-red-400">*</span></label>
              <input v-model="form.name" type="text" placeholder="cth: Kopi Susu Aren" required class="form-input" />
            </div>

            <!-- Kategori & Harga -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-400 mb-1.5">Kategori <span class="text-red-400">*</span></label>
                <select v-model="form.category_id" required class="form-input">
                  <option value="" disabled>Pilih kategori</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 mb-1.5">Harga (Rp) <span class="text-red-400">*</span></label>
                <input v-model.number="form.price" type="number" min="0" step="500" placeholder="18000" required class="form-input" />
              </div>
            </div>

            <!-- ─── Image Upload ─── -->
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1.5">
                Foto Produk <span class="text-slate-600">(opsional)</span>
              </label>

              <!-- Drop zone / file picker -->
              <div
                class="upload-zone"
                :class="{
                  'upload-zone--drag': isDragging,
                  'upload-zone--has-image': imagePreview || form.image_url
                }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
                @click="triggerFileInput"
              >
                <!-- Preview existing / selected image -->
                <template v-if="imagePreview || form.image_url">
                  <img
                    :src="imagePreview || form.image_url"
                    alt="Preview"
                    class="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                  <!-- Overlay on hover -->
                  <div class="absolute inset-0 bg-slate-950/60 rounded-xl opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                    <span class="text-[11px] font-bold text-white">Ganti Foto</span>
                  </div>
                  <!-- Remove button -->
                  <button
                    type="button"
                    @click.stop="removeImage"
                    class="absolute top-2 right-2 w-6 h-6 bg-slate-950/80 hover:bg-red-600 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </template>

                <!-- Empty state -->
                <template v-else>
                  <!-- Upload icon -->
                  <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p class="text-xs font-semibold text-slate-400">
                    <span class="text-brand-400">Klik untuk pilih</span> atau drag & drop
                  </p>
                  <p class="text-[10px] text-slate-600 mt-0.5">PNG, JPG, WebP — maks. 2 MB</p>
                </template>
              </div>

              <!-- Hidden file input -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                class="hidden"
                @change="onFileChange"
              />

              <!-- Upload progress bar -->
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Mengupload gambar...</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-brand-500 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                  />
                </div>
              </div>

              <!-- File size warning -->
              <p v-if="fileSizeError" class="text-[11px] text-red-400 font-medium mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {{ fileSizeError }}
              </p>
            </div>

            <!-- Preview price -->
            <div v-if="form.price" class="bg-slate-950/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-medium">Preview Harga</span>
              <span class="text-sm font-black text-brand-400">{{ formatRupiah(form.price) }}</span>
            </div>

            <!-- Form error -->
            <div v-if="formError" class="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-medium">
              {{ formError }}
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-secondary flex-1">Batal</button>
              <button
                type="submit"
                :disabled="saving || uploadProgress > 0"
                class="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="saving" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5 inline-block" />
                {{ saving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Produk') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ─── Delete Confirmation Modal ─── -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl animate-[scaleUp_0.25s_ease-out] p-6">
          <div class="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 class="text-base font-black text-slate-100 text-center mb-2">Hapus Produk?</h3>
          <p class="text-xs text-slate-400 text-center mb-6">
            Anda akan menghapus <span class="font-bold text-slate-200">{{ productToDelete?.name }}</span>. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1">Batal</button>
            <button @click="deleteProduct" :disabled="saving" class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60">
              <span v-if="saving" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5 inline-block" />
              {{ saving ? 'Menghapus...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ─── Toast Notification ─── -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold"
        :class="toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
      >
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import type { Product } from '~/stores/cart'

const BUCKET = 'product-images'
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

// ─── State ────────────────────────────────────────────────────────────────────

const products = ref<Product[]>([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')
const activeCategory = ref('Semua')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const formError = ref('')
const productToDelete = ref<Product | null>(null)
const categories = ref<any[]>([])

// Image upload state
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string>('')
const uploadProgress = ref(0)
const isDragging = ref(false)
const fileSizeError = ref('')

const form = reactive({
  id: '',
  name: '',
  category_id: '',
  price: 0,
  image_url: ''
})

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

// ─── Supabase ─────────────────────────────────────────────────────────────────

let supabase: any = null
let isSupabaseReady = false

const mockProducts: Product[] = []

const fetchProducts = async () => {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    if (config.public.supabase?.url && config.public.supabase?.key) {
      supabase = useSupabaseClient()
      
      // Fetch categories first
      const { data: cats } = await supabase.from('categories').select('*')
      if (cats) categories.value = cats

      // Then fetch products
      const { data, error } = await supabase.from('products').select('*').order('name')
      if (error) throw error
      products.value = data || []
      isSupabaseReady = true
    } else {
      products.value = []
      isSupabaseReady = false
    }
  } catch {
    products.value = []
    isSupabaseReady = false
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)

// ─── Computed ─────────────────────────────────────────────────────────────────

const filteredProducts = computed(() =>
  products.value.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat = activeCategory.value === 'Semua' || p.category_id === activeCategory.value
    return matchSearch && matchCat
  })
)

const countByCategory = (catId: string) => products.value.filter(p => p.category_id === catId).length
const getCategoryName = (catId: string) => categories.value.find(c => c.id === catId)?.name || 'Unknown'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const categoryBadge = (catId: string) => {
  // We can just return a default badge since colors are dynamic or unknown
  return 'px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20'
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

// ─── File / Image handling ────────────────────────────────────────────────────

const triggerFileInput = () => fileInputRef.value?.click()

const validateAndSetFile = (file: File) => {
  fileSizeError.value = ''
  if (!file.type.startsWith('image/')) {
    fileSizeError.value = 'File harus berupa gambar (PNG, JPG, WebP).'
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    fileSizeError.value = `Ukuran file terlalu besar. Maksimum 2 MB (ukuran saat ini: ${(file.size / 1024 / 1024).toFixed(1)} MB).`
    return
  }
  selectedFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndSetFile(file)
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSetFile(file)
}

const removeImage = () => {
  selectedFile.value = null
  imagePreview.value = ''
  form.image_url = ''
  fileSizeError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

/**
 * Upload selected file to Supabase Storage.
 * Returns the public URL or null if upload failed / supabase not ready.
 */
const uploadImage = async (): Promise<string | null> => {
  if (!selectedFile.value) return form.image_url || null
  if (!isSupabaseReady || !supabase) return null

  const ext = selectedFile.value.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

  uploadProgress.value = 10

  try {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, selectedFile.value, {
        cacheControl: '3600',
        upsert: false,
        contentType: selectedFile.value.type,
      })

    uploadProgress.value = 80

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName)

    uploadProgress.value = 100

    return urlData?.publicUrl ?? null
  } catch (e: any) {
    throw new Error(`Upload gambar gagal: ${e.message || 'Periksa bucket "product-images" sudah dibuat di Supabase Storage.'}`)
  } finally {
    setTimeout(() => { uploadProgress.value = 0 }, 600)
  }
}

// ─── Modal management ─────────────────────────────────────────────────────────

const resetImageState = () => {
  selectedFile.value = null
  imagePreview.value = ''
  uploadProgress.value = 0
  fileSizeError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const openAddModal = () => {
  isEditing.value = false
  Object.assign(form, { id: '', name: '', category_id: '', price: 0, image_url: '' })
  formError.value = ''
  resetImageState()
  showModal.value = true
}

const openEditModal = (product: Product) => {
  isEditing.value = true
  Object.assign(form, {
    id: product.id,
    name: product.name,
    category_id: product.category_id,
    price: product.price,
    image_url: product.image_url || ''
  })
  formError.value = ''
  resetImageState()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formError.value = ''
  resetImageState()
}

const confirmDelete = (product: Product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

// ─── CRUD operations ──────────────────────────────────────────────────────────

const saveProduct = async () => {
  formError.value = ''
  saving.value = true

  try {
    // 1. Upload image first (if a new file was selected)
    let finalImageUrl: string | null = form.image_url || null
    if (selectedFile.value) {
      finalImageUrl = await uploadImage()
    }

    const payload = {
      name: form.name,
      category_id: form.category_id,
      price: form.price,
      image_url: finalImageUrl
    }

    if (isSupabaseReady && supabase) {
      if (isEditing.value) {
        const { error } = await supabase.from('products').update(payload).eq('id', form.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
      }
      await fetchProducts()
    } else {
      // Local fallback (no supabase image upload in this mode)
      if (isEditing.value) {
        const idx = products.value.findIndex(p => p.id === form.id)
        if (idx !== -1) {
          products.value[idx] = {
            ...products.value[idx],
            ...payload,
            image_url: imagePreview.value || form.image_url || undefined
          }
        }
      } else {
        products.value.push({
          id: 'local-' + Date.now(),
          ...payload,
          image_url: imagePreview.value || undefined
        })
      }
    }

    closeModal()
    showToast(isEditing.value ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!', 'success')
  } catch (e: any) {
    formError.value = e?.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    saving.value = false
  }
}

const deleteProduct = async () => {
  if (!productToDelete.value) return
  saving.value = true
  try {
    if (isSupabaseReady && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.value.id)
      if (error) throw error
      await fetchProducts()
    } else {
      products.value = products.value.filter(p => p.id !== productToDelete.value!.id)
    }
    showDeleteModal.value = false
    showToast('Produk berhasil dihapus.', 'success')
  } catch (e: any) {
    showToast(e?.message || 'Gagal menghapus produk.', 'error')
  } finally {
    saving.value = false
    productToDelete.value = null
  }
}
</script>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* ─── Upload zone ─── */
.upload-zone {
  position: relative;
  width: 100%;
  height: 110px;
  border: 2px dashed rgb(51 65 85 / 0.8);
  border-radius: 12px;
  background: rgb(2 6 23 / 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.upload-zone:hover {
  border-color: rgb(213 96 55 / 0.5);
  background: rgb(213 96 55 / 0.04);
}

.upload-zone--drag {
  border-color: rgb(213 96 55 / 0.8) !important;
  background: rgb(213 96 55 / 0.06) !important;
  transform: scale(1.01);
}

.upload-zone--has-image {
  border-style: solid;
  border-color: rgb(51 65 85 / 0.6);
  height: 130px;
}

/* ─── Form inputs ─── */
.form-input {
  @apply w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all;
}

.btn-primary {
  @apply px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5;
}

.btn-secondary {
  @apply px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center;
}

/* ─── Transitions ─── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateY(12px) scale(0.95); }
.toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
