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

      <!-- Email Input Step -->
      <div v-if="step === 'email'" class="space-y-6">
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
            @keyup.enter="requestOTP"
          />
          <small class="text-red-500 mt-1 block" v-if="emailError">{{ emailError }}</small>
          <div class="text-sm text-surface-600 mt-2">
            <small class="text-surface-500 mt-2 block">
              Only @medtech.tn or @smu.tn emails are allowed
            </small>
          </div>
        </div>

        <Button
          label="Send Verification Code"
          size="large"
          class="w-full"
          :loading="loading"
          @click="requestOTP"
        />
        
        <div class="text-center">
          <p class="text-sm text-surface-600">
            You'll receive a 6-digit code in your email
          </p>
        </div>
      </div>

      <!-- OTP Input Step -->
      <div v-if="step === 'otp'" class="space-y-6">
        <div class="text-center">
          <div class="mb-4">
            <i class="pi pi-envelope text-4xl text-primary-500 mb-2"></i>
            <p class="font-medium text-surface-900">Check Your Email</p>
            <p class="text-sm text-surface-600">{{ email }}</p>
          </div>
          
          <p class="text-surface-700 mb-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div class="field">
          <label for="otp" class="block text-sm font-medium text-surface-700 mb-2">
            Verification Code
          </label>
          <InputText
            id="otp"
            v-model="otpCode"
            type="text"
            placeholder="123456"
            maxlength="6"
            size="large"
            class="w-full text-center text-2xl tracking-widest"
            @keyup.enter="verifyOTP"
          />
          <small class="text-surface-500 mt-2 block">
            Enter the 6-digit code from your email
          </small>
        </div>

        <div class="flex gap-3">
          <Button
            label="Back"
            severity="secondary"
            size="large"
            class="flex-1"
            @click="step = 'email'"
            :disabled="loading"
          />
          <Button
            label="Verify & Login"
            size="large"
            class="flex-1"
            :loading="loading"
            @click="verifyOTP"
          />
        </div>

        <div class="text-center">
          <p class="text-sm text-surface-600">
            Didn't receive the code?
            <Button
              label="Resend"
              text
              size="small"
              class="p-0 ml-1"
              @click="resendOTP"
              :disabled="loading"
            />
          </p>
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
const step = ref('email') // Add step state for OTP flow
const otpCode = ref('') // Add OTP code state
const otpSent = ref(false) // Track if OTP was sent

// Initialize Magic WITHOUT iframe/popup mode
const initMagic = () => {
  if (isMagicEnabled.value && import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY) {
    try {
      magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
        network: 'mainnet',
        locale: 'en',
        // ⚠️ CRITICAL: Use headless mode to avoid iframe issues
        testMode: process.env.NODE_ENV === 'development',
        // Disable features that use iframes
        overlay: false
      })
      
      console.log('✅ Magic SDK initialized (headless mode)')
      magicInitialized.value = true
      
    } catch (error) {
      console.error('❌ Failed to initialize Magic SDK:', error)
      magicInitialized.value = false
    }
  }
}

// Step 1: Request OTP (headless - no popup)
const requestOTP = async () => {
  if (!validateEmail()) return
  
  loading.value = true
  emailError.value = ''
  
  try {
    console.log('📧 Requesting OTP for:', email.value)
    
    // Use headless OTP - sends email without showing UI
    await magic.auth.loginWithEmailOTP({
      email: email.value,
      showUI: false // ⚠️ NO POPUP - headless mode
    })
    
    console.log('✅ OTP requested successfully')
    
    // Switch to OTP input step
    otpSent.value = true
    step.value = 'otp'
    loading.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Check Your Email',
      detail: 'We sent a 6-digit code to your email',
      life: 5000
    })
    
  } catch (error) {
    console.error('❌ OTP request error:', error)
    loading.value = false
    
    // Handle specific errors
    if (error.message.includes('rate limit')) {
      toast.add({
        severity: 'error',
        summary: 'Too Many Requests',
        detail: 'Please wait a few minutes before trying again',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Failed to Send Code',
        detail: 'Please try again or contact support',
        life: 3000
      })
    }
  }
}

// Step 2: Verify OTP
const verifyOTP = async () => {
  if (otpCode.value.length !== 6) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Code',
      detail: 'Please enter a 6-digit code',
      life: 3000
    })
    return
  }
  
  loading.value = true
  
  try {
    console.log('🔐 Verifying OTP code...')
    
    // Complete login with OTP code
    const didToken = await magic.auth.loginWithEmailOTP({
      email: email.value,
      code: otpCode.value
    })
    
    console.log('✅ OTP verified, got DID token')
    
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
    console.error('❌ OTP verification error:', error)
    loading.value = false
    
    if (error.message.includes('incorrect') || error.message.includes('invalid')) {
      toast.add({
        severity: 'error',
        summary: 'Invalid Code',
        detail: 'The verification code is incorrect',
        life: 3000
      })
    } else if (error.message.includes('expired')) {
      toast.add({
        severity: 'error',
        summary: 'Code Expired',
        detail: 'The code has expired. Please request a new one.',
        life: 3000
      })
      // Reset to email step
      step.value = 'email'
      otpSent.value = false
    } else {
      toast.add({
        severity: 'error',
        summary: 'Verification Failed',
        detail: 'Could not verify your code. Please try again.',
        life: 3000
      })
    }
  }
}

// Alternative: Use email redirect instead of OTP
const loginWithMagicRedirect = async () => {
  if (!validateEmail()) return
  
  loading.value = true
  emailError.value = ''
  
  try {
    // Use Magic Link instead of OTP (no iframe needed)
    const didToken = await magic.auth.loginWithMagicLink({
      email: email.value,
      redirectURI: window.location.origin + '/callback'
    })
    
    // If we get here immediately, user was already logged in
    if (didToken) {
      await verifyWithBackend(didToken)
    } else {
      // Magic link was sent via email
      toast.add({
        severity: 'success',
        summary: 'Check Your Email',
        detail: 'Click the magic link we sent to your email',
        life: 5000
      })
    }
    
  } catch (error) {
    console.error('❌ Magic Link error:', error)
    loading.value = false
    
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: 'Could not send magic link. Please try OTP instead.',
      life: 3000
    })
  }
}

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
    throw error
  }
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

// Handle callback from Magic Link
const handleMagicCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const magicCredential = urlParams.get('magic_credential')
  
  if (magicCredential && magic) {
    loading.value = true
    try {
      const result = await magic.auth.loginWithCredential(magicCredential)
      if (result) {
        await verifyWithBackend(result)
      }
    } catch (error) {
      console.error('Callback error:', error)
      loading.value = false
    }
  }
}

// Resend OTP
const resendOTP = () => {
  otpCode.value = ''
  step.value = 'email'
  otpSent.value = false
  requestOTP()
}

// Initialize
onMounted(() => {
  initMagic()
  
  // Handle Magic callback if present
  handleMagicCallback()
  
  // Check URL for callback
  if (window.location.pathname === '/callback' || 
      window.location.search.includes('magic_credential')) {
    handleMagicCallback()
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
