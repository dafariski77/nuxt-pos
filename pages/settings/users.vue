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
            <h1 class="text-2xl font-bold text-slate-100">Manajemen Karyawan</h1>
            <p class="text-sm text-slate-400">Kelola akses kasir dan admin untuk toko Anda</p>
          </div>
        </div>
        
        <button v-if="isOwner" @click="showAddModal = true" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Karyawan
        </button>
      </div>

      <!-- Users List -->
      <div class="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div v-if="loading" class="p-8 text-center text-slate-500">
          <div class="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3"></div>
          Memuat data karyawan...
        </div>
        
        <div v-else-if="users.length === 0" class="p-8 text-center text-slate-500">
          Belum ada karyawan.
        </div>
        
        <table v-else class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th class="p-4 font-semibold">User ID</th>
              <th class="p-4 font-semibold">Role</th>
              <th class="p-4 font-semibold">Bergabung Pada</th>
              <th v-if="isOwner" class="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/50 text-sm">
            <tr v-for="u in users" :key="u.user_id" class="hover:bg-slate-800/30 transition-colors">
              <td class="p-4 text-slate-300 font-mono text-xs">
                {{ u.user_id }}
                <span v-if="u.user_id === currentUser?.id" class="ml-2 px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded text-[10px] uppercase font-bold tracking-widest">Anda</span>
              </td>
              <td class="p-4">
                <span 
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                  :class="u.role === 'owner' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="p-4 text-slate-500">{{ new Date(u.created_at).toLocaleDateString('id-ID') }}</td>
              <td v-if="isOwner" class="p-4 text-right">
                <button 
                  v-if="u.user_id !== currentUser?.id"
                  @click="deleteUser(u.user_id)" 
                  class="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Hapus Karyawan"
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

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-100">Tambah Karyawan Baru</h3>
          <button @click="showAddModal = false" class="text-slate-500 hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createUser" class="p-6 space-y-4">
          <div v-if="formError" class="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
            {{ formError }}
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Karyawan</label>
            <input v-model="form.email" type="email" required placeholder="kasir1@toko.com" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-colors" />
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Password (Min 6 Karakter)</label>
            <input v-model="form.password" type="password" required minlength="6" placeholder="••••••••" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-colors" />
          </div>
          
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
            <select v-model="form.role" class="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 focus:outline-none transition-colors appearance-none">
              <option value="kasir">Kasir</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="showAddModal = false" class="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Batal</button>
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
const currentUser = user

const users = ref<any[]>([])
const loading = ref(true)
const tenantId = ref('')
const currentUserRole = ref('')

const showAddModal = ref(false)
const formLoading = ref(false)
const formError = ref('')
const form = ref({
  email: '',
  password: '',
  role: 'kasir'
})

const isOwner = computed(() => currentUserRole.value === 'owner')

const fetchUsers = async () => {
  loading.value = true
  try {
    // Get current user's profile to know tenant_id and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('user_id', currentUser.value?.id)
      .single()

    if (profile) {
      tenantId.value = profile.tenant_id
      currentUserRole.value = profile.role

      // Fetch all users in this tenant
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: true })

      if (data) users.value = data
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  formError.value = ''
  formLoading.value = true
  try {
    const res = await $fetch('/api/users', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        role: form.role,
        tenantId: tenantId.value
      }
    })
    
    // Refresh list
    await fetchUsers()
    
    // Reset and close
    form.value = { email: '', password: '', role: 'kasir' }
    showAddModal.value = false
    
  } catch (err: any) {
    formError.value = err.data?.statusMessage || 'Gagal membuat karyawan.'
  } finally {
    formLoading.value = false
  }
}

const deleteUser = async (id: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini? Mereka tidak akan bisa login lagi.')) return
  
  try {
    await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.user_id !== id)
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Gagal menghapus karyawan')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
