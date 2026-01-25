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
import { ref, onMounted, onUnmounted } from 'vue'
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

// Polling for popup completion
let popupCheckInterval = null

// Initialize Magic with Render-compatible settings
const initMagic = () => {
  if (isMagicEnabled.value && import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY) {
    try {
      // Use CUSTOM endpoint configuration for Render
      magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
        network: 'mainnet',
        locale: 'en',
        
        // ⚠️ CRITICAL: Configure endpoints for Render compatibility
        endpoint: {
          url: 'https://api.magic.link',
          headers: {
            // Add headers that might help with Render's security
            'X-Frame-Options': 'ALLOW-FROM https://makerspaceinventorymanager-2.onrender.com'
          }
        },
        
        // Configure overlay/popup for Render
        overlay: {
          // Use a custom modal container instead of iframe
          // This bypasses iframe restrictions
          custom: true,
          styles: {
            // Match your app's styling
            fontFamily: 'Inter, sans-serif',
            primaryColor: '#667eea',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }
        },
        
        // Reduce timeout for Render's free tier
        requestTimeout: 15000,
        
        // Disable auto-refresh to prevent 401s
        tokenRenewal: false
      })
      
      console.log('✅ Magic SDK initialized with Render configuration')
      magicInitialized.value = true
      
      // Listen for Magic events
      setupMagicListeners()
      
    } catch (error) {
      console.error('❌ Failed to initialize Magic SDK:', error)
      magicInitialized.value = false
    }
  }
}

// Setup Magic event listeners
const setupMagicListeners = () => {
  if (!magic) return
  
  // Listen for popup events
  magic.preload().then(() => {
    console.log('Magic preloaded successfully')
  }).catch(error => {
    console.warn('Magic preload warning:', error.message)
  })
}

// Main login function with popup
const loginWithMagic = async () => {
  if (!validateEmail()) return
  
  loading.value = true
  emailError.value = ''
  
  try {
    console.log('🔐 Starting Magic login with popup...')
    
    // Start Magic popup and get promise
    const loginPromise = magic.auth.loginWithEmailOTP({
      email: email.value,
      showUI: true, // KEEP THE POPUP
      
      // Configure popup for Render
      overlay: {
        // Alternative: Use window.open instead of iframe
        launchMode: 'popup',
        
        // Customize the popup appearance
        styles: {
          fontFamily: 'Inter, sans-serif',
          primaryColor: '#667eea',
          backgroundColor: '#ffffff'
        },
        
        // Add render-specific configuration
        render: {
          // Try different rendering modes
          mode: 'popup', // 'popup', 'modal', or 'inline'
          
          // Ensure popup opens correctly on Render
          target: '_blank',
          features: 'width=400,height=600,scrollbars=yes'
        }
      }
    })
    
    // Set a timeout for the popup
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Popup timeout - please check your popup blocker')), 30000)
    })
    
    // Race between login and timeout
    const didToken = await Promise.race([loginPromise, timeoutPromise])
    
    console.log('✅ Magic login successful, token received')
    
    // Verify with backend
    await verifyWithBackend(didToken)
    
  } catch (error) {
    console.error('❌ Magic login error:', error)
    loading.value = false
    
    // Handle specific errors
    if (error.message.includes('user denied') || error.code === -10000) {
      toast.add({
        severity: 'info',
        summary: 'Login Cancelled',
        detail: 'You closed the login popup',
        life: 3000
      })
    } else if (error.message.includes('popup') || error.message.includes('blocked')) {
      handlePopupBlocked()
    } else if (error.message.includes('timeout')) {
      handlePopupTimeout()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'Failed to login',
        life: 3000
      })
    }
  }
}

// Handle popup being blocked
const handlePopupBlocked = () => {
  toast.add({
    severity: 'warn',
    summary: 'Popup Blocked',
    detail: 'Please allow popups for this site and try again',
    life: 5000
  })
  
  // Alternative: Show instructions
  setTimeout(() => {
    if (confirm('Popup was blocked. Would you like to try the OTP code method instead?')) {
      useOTPInstead()
    }
  }, 1000)
}

// Handle popup timeout
const handlePopupTimeout = () => {
  toast.add({
    severity: 'warn',
    summary: 'Taking Too Long',
    detail: 'Check your email for the verification code',
    life: 5000
  })
  
  // Start polling for login completion
  startPollingForLogin()
}

// Start polling for Magic login completion
const startPollingForLogin = () => {
  if (popupCheckInterval) clearInterval(popupCheckInterval)
  
  popupCheckInterval = setInterval(async () => {
    try {
      if (magic && await magic.user.isLoggedIn()) {
        clearInterval(popupCheckInterval)
        const didToken = await magic.user.getIdToken()
        await verifyWithBackend(didToken)
      }
    } catch (error) {
      console.log('Polling error:', error)
    }
  }, 2000) // Check every 2 seconds
  
  // Stop polling after 5 minutes
  setTimeout(() => {
    if (popupCheckInterval) {
      clearInterval(popupCheckInterval)
      toast.add({
        severity: 'error',
        summary: 'Login Expired',
        detail: 'Please try again',
        life: 3000
      })
    }
  }, 5 * 60 * 1000)
}

// Verify with backend
const verifyWithBackend = async (didToken) => {
  try {
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
    console.error('Backend verification error:', error)
    throw error
  }
}

// Alternative OTP method (fallback)
const useOTPInstead = () => {
  // You can implement a fallback OTP UI here
  toast.add({
    severity: 'info',
    summary: 'OTP Method',
    detail: 'We will send a code to your email instead',
    life: 3000
  })
  
  // You would switch to OTP UI here
  // For now, just reload to show OTP option
  setTimeout(() => window.location.reload(), 1000)
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

// Handle successful login
const handleLoginSuccess = (data) => {
  // Save token and user data
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
  
  // Clear any polling intervals
  if (popupCheckInterval) {
    clearInterval(popupCheckInterval)
  }
  
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

// Check if popups are allowed
const checkPopupSupport = () => {
  const popup = window.open('', '_blank', 'width=1,height=1')
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    console.warn('Popups may be blocked')
    return false
  }
  popup.close()
  return true
}

// Initialize
onMounted(() => {
  // Check popup support
  const popupsAllowed = checkPopupSupport()
  if (!popupsAllowed) {
    console.log('⚠️ Popups may be blocked by browser')
  }
  
  initMagic()
  
  // Handle Magic callback if URL has magic_credential
  const urlParams = new URLSearchParams(window.location.search)
  const magicCredential = urlParams.get('magic_credential')
  
  if (magicCredential && magic) {
    loading.value = true
    magic.auth.loginWithCredential(magicCredential)
      .then(didToken => verifyWithBackend(didToken))
      .catch(error => {
        console.error('Callback error:', error)
        loading.value = false
      })
  }
})

// Cleanup
onUnmounted(() => {
  if (popupCheckInterval) {
    clearInterval(popupCheckInterval)
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
