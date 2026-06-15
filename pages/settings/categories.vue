<template>
  <div class="min-h-screen bg-slate-950 p-4 md:p-6 lg:p-8 select-none">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-slate-100">Manajemen Kategori</h1>
            <p class="text-sm text-slate-400">Kelola kategori produk untuk menu kasir</p>
          </div>
        </div>
        
        <button v-if="isOwner" @click="openAddModal" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Kategori
        </button>
      </div>

      <!-- Categories List -->
      <div class="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-slate-500">
          <div class="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3"></div>
          Memuat data kategori...
        </div>
        
        <div v-else-if="categories.length === 0" class="p-8 text-center text-slate-500">
          Belum ada kategori
        </div>
        
        <table v-else class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th class="p-4 font-semibold">Nama Kategori</th>
              <th class="p-4 font-semibold">Ditambahkan Pada</th>
              <th v-if="isOwner" class="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-sm">
            <tr v-for="c in categories" :key="c.id" class="hover:bg-slate-800/30 transition-colors">
              <td class="p-4 text-slate-100 font-medium">
                {{ c.name }}
              </td>
              <td class="p-4 text-slate-500">{{ new Date(c.created_at).toLocaleDateString('id-ID') }}</td>
              <td v-if="isOwner" class="p-4 text-right flex justify-end gap-2">
                <button 
                  @click="openEditModal(c)" 
                  class="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                  title="Edit Kategori"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button 
                  @click="deleteCategory(c.id)" 
                  class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Hapus Kategori"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-100">{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h3>
          <button @click="showModal = false" class="text-slate-500 hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveCategory" class="p-6 space-y-4">
          <div v-if="formError" class="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
            {{ formError }}
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Kategori</label>
            <input v-model="form.name" type="text" required placeholder="Contoh: Pakaian Pria" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-colors" />
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="showModal = false" class="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Batal</button>
            <button type="submit" :disabled="formLoading" class="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <span v-if="formLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const categories = ref<any[]>([])
const loading = ref(true)
const currentUserRole = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const formLoading = ref(false)
const formError = ref('')
const form = ref({
  id: '',
  name: ''
})

const isOwner = computed(() => currentUserRole.value === 'owner')

const fetchCategories = async () => {
  loading.value = true
  try {
    // Get current user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.value?.id)
      .single()

    if (profile) currentUserRole.value = profile.role

    // Fetch categories
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (data) categories.value = data
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  formError.value = ''
  form.value = { id: '', name: '' }
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (category: any) => {
  formError.value = ''
  form.value = { id: category.id, name: category.name }
  isEditing.value = true
  showModal.value = true
}

const saveCategory = async () => {
  formError.value = ''
  formLoading.value = true
  try {
    if (isEditing.value) {
      const { error } = await supabase
        .from('categories')
        .update({ name: form.name })
        .eq('id', form.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ name: form.name })
      
      if (error) throw error
    }
    
    await fetchCategories()
    showModal.value = false
  } catch (err: any) {
    formError.value = err.message || 'Gagal menyimpan kategori.'
  } finally {
    formLoading.value = false
  }
}

const deleteCategory = async (id: string) => {
  if (!confirm('Hapus kategori ini? (Hanya bisa dihapus jika tidak ada produk yang menggunakannya)')) return
  
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      
    if (error) {
      if (error.code === '23503') throw new Error('Kategori ini masih digunakan oleh satu atau lebih produk.')
      throw error
    }
    
    categories.value = categories.value.filter(c => c.id !== id)
  } catch (err: any) {
    alert(err.message || 'Gagal menghapus kategori')
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
