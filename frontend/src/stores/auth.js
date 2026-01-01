// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')

  // Request login code
  const requestLoginCode = async (email) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/request-code', { email })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to request code'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Verify code and login
  const verifyLoginCode = async (email, code) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/verify-code', { email, code })
      const { token: authToken, user: userData } = response.data.data
      
      // Store token and user
      token.value = authToken
      user.value = userData
      localStorage.setItem('token', authToken)
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Check auth status (on app load)
  const checkAuth = async () => {
    if (!token.value) return
    
    try {
      // You might want to add a /me endpoint to verify token
      // For now, just check if token exists
      const response = await api.get('/auth/me') // Create this endpoint later
      user.value = response.data.data
    } catch (err) {
      // Token invalid, clear it
      logout()
    }
  }

  // Logout
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isStudent,
    requestLoginCode,
    verifyLoginCode,
    checkAuth,
    logout
  }
})