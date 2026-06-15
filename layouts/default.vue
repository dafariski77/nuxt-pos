<template>
  <div class="flex min-h-screen bg-slate-950 text-slate-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'sidebar fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-60' : 'w-[70px]'
      ]"
    >
      <!-- Logo area -->
      <div class="flex items-center gap-3 px-4 py-4 border-b border-slate-800/80 min-h-[65px]">
        <div class="flex-shrink-0 w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-black text-lg tracking-tighter">
          G
        </div>
        <Transition name="slide-fade">
          <div v-if="sidebarOpen" class="overflow-hidden whitespace-nowrap">
            <h1 class="text-[14px] font-black tracking-tight text-slate-100 flex items-center gap-1.5 leading-none">
              {{ authStore.user?.storeName || 'GravityPOS' }}
              <span class="text-[9px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md border border-brand-500/20">MVP</span>
            </h1>
            <p class="text-[10px] text-slate-400 mt-0.5 font-medium">Point of Sale</p>
          </div>
        </Transition>
      </div>

      <!-- Navigation links -->
      <nav class="flex-grow flex flex-col gap-1 p-3 overflow-y-auto overflow-x-hidden">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item group"
          :class="{ 'justify-center': !sidebarOpen }"
          :title="!sidebarOpen ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon" />
          <Transition name="slide-fade">
            <span v-if="sidebarOpen" class="nav-label">{{ item.label }}</span>
          </Transition>
        </NuxtLink>
      </nav>

      <!-- Bottom section: user + logout -->
      <div class="p-3 border-t border-slate-800/80">
        <!-- Connection Status -->
        <div
          v-if="sidebarOpen"
          class="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-slate-900/60"
        >
          <span
            class="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            :class="isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'"
          />
          <span class="text-[10px] font-semibold text-slate-400 truncate">
            {{ isConnected ? 'Supabase Aktif' : 'Mode Offline' }}
          </span>
        </div>

        <!-- User info -->
        <div
          class="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-800/40 transition-all cursor-default"
          :class="{ 'justify-center': !sidebarOpen }"
        >
          <div class="flex-shrink-0 w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[11px] font-black uppercase">
            {{ authStore.userEmail.charAt(0) }}
          </div>
          <Transition name="slide-fade">
            <div v-if="sidebarOpen" class="overflow-hidden flex-grow min-w-0">
              <p class="text-xs font-bold text-slate-300 truncate">{{ authStore.user?.storeName || authStore.userEmail.split('@')[0] }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ authStore.userEmail }}</p>
            </div>
          </Transition>
        </div>

        <!-- Logout -->
        <button
          @click="handleLogout"
          class="mt-2 w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
          :class="{ 'justify-center': !sidebarOpen }"
          title="Keluar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <Transition name="slide-fade">
            <span v-if="sidebarOpen" class="text-xs font-semibold">Keluar</span>
          </Transition>
        </button>
      </div>
    </aside>

    <!-- Main content wrapper -->
    <div
      class="flex flex-col flex-grow min-h-screen transition-all duration-300 ease-in-out"
      :class="sidebarOpen ? 'ml-60' : 'ml-[70px]'"
    >
      <!-- Top bar -->
      <header class="sticky top-0 z-20 glass-panel border-t-0 border-x-0 rounded-none px-6 py-4 flex items-center justify-between min-h-[65px]">
        <!-- Toggle button + page title -->
        <div class="flex items-center gap-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all active:scale-95"
            :title="sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
          <div>
            <h2 class="text-[15px] font-black tracking-tight text-slate-100 leading-none">{{ currentPageTitle }}</h2>
            <p class="text-[11px] text-slate-400 mt-0.5 font-medium">{{ currentTimeString }}</p>
          </div>
        </div>

        <!-- Right side slot -->
        <slot name="header-right" />
      </header>

      <!-- Page content -->
      <main class="flex-grow overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()

const sidebarOpen = ref(true)
const currentTime = ref(new Date())
const isConnected = ref(false)

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const currentTimeString = computed(() =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'medium' }).format(currentTime.value)
)

const navItems = computed(() => {
  const baseNav = [
    {
      to: '/',
      label: 'Katalog Kasir',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>`
    },
    {
      to: '/products',
      label: 'Kelola Produk',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>`
    },
    {
      to: '/reports',
      label: 'Laporan Penjualan',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`
    }
  ]

  if (authStore.user?.role === 'owner') {
    baseNav.push(
      {
        to: '/settings/categories',
        label: 'Kategori Produk',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>`
      },
      {
        to: '/settings/users',
        label: 'Manajemen Karyawan',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>`
      }
    )
  }

  return baseNav
})

const currentPageTitle = computed(() => {
  const item = navItems.value.find(n => n.to === route.path)
  return item ? item.label : 'GravityPOS'
})

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.97) 0%, rgba(15, 23, 42, 0.98) 100%);
  border-right: 1px solid rgba(51, 65, 85, 0.5);
  backdrop-filter: blur(12px);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(148 163 184);
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(30, 41, 59, 0.8);
  color: rgb(226 232 240);
}

.nav-item.router-link-exact-active {
  background: rgba(99, 102, 241, 0.12);
  color: rgb(129 140 248);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  white-space: nowrap;
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  transition: all 0.15s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
