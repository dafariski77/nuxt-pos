import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // On server-side or initial client load, initialize the auth state from local session / Supabase
  if (to.path !== '/login' || authStore.isAuthenticated) {
    // Only initialize if we haven't checked or if we need to load session
    if (authStore.user === null) {
      await authStore.initializeAuth()
    }
  }

  // Redirect to login if user is not authenticated and trying to access a protected page
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Redirect to home if user is already authenticated and trying to access login page
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
