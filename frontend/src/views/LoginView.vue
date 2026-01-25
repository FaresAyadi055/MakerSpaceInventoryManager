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
const magicInitialized = ref(false)

// Initialize Magic with proper error handling
const initMagic = () => {
  if (isMagicEnabled.value && import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY) {
    try {
      magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
        network: 'mainnet',
        locale: 'en',
        // DISABLE auto refresh to prevent 401 errors
        tokenRenewal: false,
        autoRefreshToken: false,
        endpoint: 'https://api.magic.link'
      })
      
      console.log('✅ Magic SDK initialized')
      magicInitialized.value = true
      
      // Store globally for logout
      window.magic = magic
      
      // Check if we should force logout (when coming from logout action)
      const forceLogout = sessionStorage.getItem('force_magic_logout')
      if (forceLogout === 'true') {
        console.log('Force logging out from Magic...')
        magic.user.logout().finally(() => {
          sessionStorage.removeItem('force_magic_logout')
          clearMagicStorage()
        })
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Magic SDK:', error)
      magicInitialized.value = false
      // Fallback to backend-only auth
      toast.add({
        severity: 'warn',
        summary: 'Magic SDK Failed',
        detail: 'Using fallback authentication',
        life: 3000
      })
    }
  } else {
    console.log(' Magic SDK disabled, using backend-only auth')
    magicInitialized.value = false
  }
}

// Clear all Magic-related storage
const clearMagicStorage = () => {
  console.log('🧹 Clearing Magic storage...')
  // Clear Magic localStorage keys
  const magicKeys = Object.keys(localStorage).filter(key => 
    key.startsWith('__magic') || 
    key.startsWith('magic_') || 
    key.includes('did:') ||
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

// Main login function with retry logic
const loginWithMagic = async () => {
  if (!validateEmail()) return
  
  loading.value = true
  emailError.value = ''
  
  try {
    // First, clear any existing Magic sessions to prevent conflicts
    clearMagicStorage()
    
    // If Magic SDK is not initialized or failed, use backend-only
    if (!magicInitialized.value || !magic) {
      console.log(' Magic SDK not available, using backend-only login')
      return await loginWithBackendOnly()
    }
    
    // Try Magic login with retry for 401 errors
    let didToken
    let attempts = 0
    const maxAttempts = 2
    
    while (attempts < maxAttempts) {
      attempts++
      console.log(` Magic login attempt ${attempts}/${maxAttempts}`)
      
      try {
        // Clear any stale sessions before each attempt
        if (attempts > 1) {
          await magic.user.logout().catch(() => {})
          clearMagicStorage()
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s
        }
        
        didToken = await magic.auth.loginWithEmailOTP({
          email: email.value,
          showUI: true,
          redirectURI: window.location.origin + '/callback'
        })
        
        console.log(' Magic login successful')
        break // Success, exit loop
        
      } catch (magicError) {
        console.error(` Magic attempt ${attempts} failed:`, magicError.message)
        
        // If it's a 401/refresh error and we have attempts left, retry
        const isRefreshError = magicError.message.includes('401') || 
                               magicError.message.includes('Unauthorized') ||
                               magicError.code === -32000 ||
                               magicError.code === -10000
        
        if (isRefreshError && attempts < maxAttempts) {
          console.log(' Magic refresh error, retrying...')
          continue
        }
        
        // If all attempts failed or it's not a refresh error, fallback
        console.log(' Magic failed, falling back to backend-only')
        return await loginWithBackendOnly()
      }
    }
    
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
      throw new Error(data.message || 'Login verification failed')
    }
    
  } catch (error) {
    console.error(' Login error:', error)
    
    // Check for specific error types
    if (error.message.includes('user denied') || error.code === -10000) {
      toast.add({
        severity: 'info',
        summary: 'Login Cancelled',
        detail: 'You closed the login popup',
        life: 3000
      })
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      toast.add({
        severity: 'warn',
        summary: 'Session Issue',
        detail: 'Authentication issue. Please try again.',
        life: 3000
      })
      // Clear everything and reload
      clearMagicStorage()
      setTimeout(() => window.location.reload(), 1000)
    } else {
      toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'Failed to login',
        life: 3000
      })
    }
  } finally {
    loading.value = false
  }
}

// Fallback: Backend-only login (no Magic)
const loginWithBackendOnly = async () => {
  try {
    console.log('🔄 Using backend-only login fallback')
    
    // Request verification code from backend
    const requestResponse = await fetch(apiUrl + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })
    
    const requestData = await requestResponse.json()
    
    if (requestData.success) {
      toast.add({
        severity: 'success',
        summary: 'Fallback Mode',
        detail: 'Using email verification (Magic unavailable)',
        life: 3000
      })
      
      // Show code input UI (you'll need to implement this)
      // For now, just show the code if in debug mode
      if (requestData.debugCode) {
        toast.add({
          severity: 'info',
          summary: 'Debug Code',
          detail: `Code: ${requestData.debugCode}`,
          life: 5000
        })
      }
      
      // You would normally switch to code input UI here
      // For now, just inform user
      toast.add({
        severity: 'info',
        summary: 'Check Email',
        detail: 'Please check your email for the verification code',
        life: 3000
      })
      
    } else {
      throw new Error(requestData.message || 'Backend login failed')
    }
    
  } catch (error) {
    console.error(' Backend-only login error:', error)
    throw error
  }
}

// Handle successful login
const handleLoginSuccess = (data) => {
  // Save token and user data
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  
  // Clear Magic storage on successful login
  clearMagicStorage()
  
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
  // Clear any existing sessions first
  clearMagicStorage()
  
  // Initialize Magic
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
  
  // Add a small delay to let Magic SDK settle
  setTimeout(() => {
    console.log(' Login ready, Magic initialized:', magicInitialized.value)
  }, 500)
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
