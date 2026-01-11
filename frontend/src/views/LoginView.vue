<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <i class="pi pi-box text-6xl text-primary-500 mb-4"></i>
        <h1 class="text-3xl font-bold text-surface-900">MakerSpace Inventory</h1>
        <p class="text-surface-600 mt-2">Sign in with your school email</p>
      </div>

      <!-- Single Email Input Form -->
      <div class="space-y-6">
        <div class="field">
          <label for="email" class="block text-sm font-medium text-surface-700 mb-2">
            School Email
          </label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="name@medtech.tn"
            size="large"
            class="w-full"
            :invalid="!!emailError"
            @keyup.enter="loginWithMagic"
          />
          <small class="text-red-500 mt-1 block" v-if="emailError">{{ emailError }}</small>
          <div class="text-sm text-surface-600 mt-2">
            <small class="text-surface-500 mt-2 block">
              Only @medtech.tn or @smu.tn emails are allowed
            </small>
          </div>
        </div>

        <Button
          label="Verify Email"
          size="large"
          class="w-full"
          :loading="loading"
          @click="loginWithMagic"
        />

        <div class="text-center">
          <p class="text-sm text-surface-600">
            You'll receive a 6-digit code to verify your email
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
        <div class="flex items-center justify-center">
          <i class="pi pi-spin pi-spinner text-2xl text-blue-500 mr-3"></i>
          <span class="text-blue-700">Sending verification code...</span>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { Magic } from 'magic-sdk'

const router = useRouter()
const toast = useToast()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Magic SDK instance
let magic = null
const isMagicEnabled = ref(import.meta.env.VITE_MAGIC_ENABLED === 'true' || import.meta.env.PROD)
const email = ref('')
const loading = ref(false)
const emailError = ref('')

// Initialize Magic
const initMagic = () => {
  if (isMagicEnabled.value && import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY) {
    try {
      magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY)
      console.log('Magic SDK initialized')
      
      // Store globally for logout
      window.magic = magic
      
      // Check if we should force logout (when coming from logout action)
      const forceLogout = sessionStorage.getItem('force_magic_logout')
      if (forceLogout === 'true') {
        console.log('Force logging out from Magic...')
        magic.user.logout().finally(() => {
          sessionStorage.removeItem('force_magic_logout')
          // Clear any remaining Magic tokens
          clearMagicStorage()
        })
      }
      
    } catch (error) {
      console.error('Failed to initialize Magic SDK:', error)
    }
  }
}

// Clear all Magic-related storage
const clearMagicStorage = () => {
  // Clear Magic localStorage keys
  const magicKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('__magic') || 
    key.startsWith('magic_') || 
    key.includes('did') ||
    key.includes('DID') ||
    key.includes('oauth')
  )
  magicKeys.forEach(key => {
    console.log('Removing Magic key:', key)
    localStorage.removeItem(key)
  })
  
  // Clear Magic sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.startsWith('__magic') || 
    key.includes('magic')
  )
  sessionKeys.forEach(key => {
    console.log('Removing Magic session key:', key)
    sessionStorage.removeItem(key)
  })
}

// Email validation
const validateEmail = () => {
  emailError.value = ''
  
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please use a valid @medtech.tn or @smu.tn email'
    return false
  }
  
  return true
}

// Main login function
const loginWithMagic = async () => {
  if (!validateEmail()) return
  
  loading.value = true
  emailError.value = ''
  
  try {
    // First, ensure we're logged out from any existing Magic session
    if (magic) {
      try {
        const isLoggedIn = await magic.user.isLoggedIn()
        if (isLoggedIn) {
          console.log('Existing Magic session found, logging out...')
          await magic.user.logout()
          clearMagicStorage()
        }
      } catch (error) {
        console.log('Error checking Magic session:', error)
      }
    }
    
    // Start new Magic login
    const didToken = await magic.auth.loginWithEmailOTP({
      email: email.value,
      showUI: true
    })
    
    // Verify with backend
    const response = await fetch(apiUrl + '/auth/magic/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ didToken })
    })
    
    const data = await response.json()
    
    if (data.success) {
      handleLoginSuccess(data.data)
    } else {
      throw new Error(data.message || 'Login failed')
    }
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.message?.includes('user denied') || error.code === -10000) {
      toast.add({
        severity: 'info',
        summary: 'Login Cancelled',
        detail: 'You can try again',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'Failed to start login process',
        life: 3000
      })
    }
  } finally {
    loading.value = false
  }
}

// Handle successful login
const handleLoginSuccess = (data) => {
  // Save token and user data
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  
  toast.add({
    severity: 'success',
    summary: 'Welcome!',
    detail: `Logged in as ${data.user.email}`,
    life: 2000
  })
  
  // Redirect to dashboard
  setTimeout(() => {
    router.push('/home')
  }, 1500)
}

// Initialize
onMounted(() => {
  initMagic()
  
  // Check if we're coming from a logout
  const fromLogout = sessionStorage.getItem('from_logout')
  if (fromLogout === 'true') {
    console.log('Coming from logout, clearing Magic storage...')
    clearMagicStorage()
    if (magic) {
      magic.user.logout().catch(() => {})
    }
    sessionStorage.removeItem('from_logout')
  }
})
</script>
<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Improved text hierarchy and spacing */
.text-center {
  margin-bottom: 2.5rem;
}

.text-center h1 {
  font-size: 2.25rem;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #111827;
  margin-bottom: 0.75rem;
}

.text-center p {
  font-size: 1.125rem;
  line-height: 1.5;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* Better spacing for sections */
.space-y-6 > * + * {
  margin-top: 1.75rem;
}

/* Field spacing improvements */
.field {
  margin-bottom: 1.75rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

/* Input text improvements */
:deep(.p-inputtext) {
  font-size: 1rem;
  line-height: 1.5;
  padding: 0.875rem 1rem;
}

:deep(.p-inputtext-lg) {
  font-size: 1.125rem;
  padding: 1rem 1.25rem;
}

/* Button spacing */
.p-button {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Loading spinner */
.pi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Error message spacing */
.text-red-500 {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.text-surface-500 {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  line-height: 1.4;
  color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .login-card {
    padding: 32px 24px;
    margin: 0 16px;
  }
  
  .text-center h1 {
    font-size: 1.875rem;
  }
  
  .text-center p {
    font-size: 1rem;
  }
}
</style>