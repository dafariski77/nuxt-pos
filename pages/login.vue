<template>
  <div class="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
    <!-- Decorative Blur Background Orbs -->
    <div class="absolute w-[350px] h-[350px] bg-brand-500/10 rounded-full blur-[100px] -top-12 -left-12 pointer-events-none animate-pulse"></div>
    <div class="absolute w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[120px] -bottom-24 -right-24 pointer-events-none animate-pulse"></div>

    <!-- Login Container -->
    <div 
      class="w-full max-w-md p-8 glass-panel rounded-3xl shadow-2xl relative z-10 transition-all duration-300"
      :class="{ 'animate-shake': shouldShake }"
    >
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/35 text-white font-black text-2xl tracking-tighter mx-auto mb-4 animate-[bounce_2s_infinite]">
          G
        </div>
        <h2 class="text-2xl font-black text-slate-100 tracking-tight">
          {{ isSignUpMode ? 'Daftar Akun Baru' : 'Masuk Kasir' }}
        </h2>
        <p class="text-xs text-slate-400 mt-1.5 font-medium">
          {{ isSignUpMode ? 'Daftar akun kasir untuk mengelola transaksi' : 'Gunakan akun kasir Anda untuk mengakses aplikasi' }}
        </p>
      </div>

      <!-- Auth Error Toast -->
      <div
        v-if="errorMessage"
        class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start gap-2 mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mt-0.5 shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008h-.008v-.008Z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Store Name input (Only for Sign Up) -->
        <div v-if="isSignUpMode" class="space-y-1.5 transition-all duration-300">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Toko</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 .75.75Z" />
              </svg>
            </span>
            <input
              v-model="storeName"
              type="text"
              :required="isSignUpMode"
              placeholder="Contoh: Kopi Senja"
              class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Username/Email input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Username atau Email</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <input
              v-model="email"
              type="text"
              required
              placeholder="kasir / email@anda.com"
              class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Password input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <div class="relative group">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/30 transition-all duration-300"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full mt-2 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98]"
        >
          <span v-if="authStore.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <span>{{ authStore.loading ? 'Memproses...' : (isSignUpMode ? 'Daftar Sekarang' : 'Masuk') }}</span>
        </button>
      </form>

      <!-- Toggle mode text -->
      <div class="mt-6 text-center text-xs text-slate-400">
        {{ isSignUpMode ? 'Sudah punya akun?' : 'Belum punya akun?' }}
        <button
          @click="toggleMode"
          class="font-bold text-brand-400 hover:text-brand-300 transition-colors ml-1 focus:outline-none"
        >
          {{ isSignUpMode ? 'Masuk' : 'Daftar' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const authStore = useAuthStore()

// State
const storeName = ref('')
const email = ref('')
const password = ref('')
const isSignUpMode = ref(false)
const errorMessage = ref('')
const shouldShake = ref(false)

const toggleMode = () => {
  isSignUpMode.value = !isSignUpMode.value
  errorMessage.value = ''
}

const triggerShake = () => {
  shouldShake.value = true
  setTimeout(() => {
    shouldShake.value = false
  }, 600)
}

const handleSubmit = async () => {
  errorMessage.value = ''
  
  let success = false
  if (isSignUpMode.value) {
    // Basic validation
    if (password.value.length < 6) {
      errorMessage.value = 'Password harus minimal 6 karakter.'
      triggerShake()
      return
    }
    if (!storeName.value.trim()) {
      errorMessage.value = 'Nama toko wajib diisi.'
      triggerShake()
      return
    }
    success = await authStore.signUp(email.value, password.value, storeName.value)
  } else {
    success = await authStore.login(email.value, password.value)
  }

  if (success) {
    navigateTo('/')
  } else {
    errorMessage.value = authStore.error || 'Terjadi kesalahan autentikasi.'
    triggerShake()
  }
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
  20%, 40%, 60%, 80% { transform: translateX(6px); }
}

.animate-shake {
  animation: shake 0.6s ease-in-out;
}
</style>
