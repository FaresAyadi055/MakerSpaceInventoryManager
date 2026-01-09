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

          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="name@medtech.tn"
            size="large"
            class="w-full"
            :invalid="!!emailError"
            @keyup.enter="requestCode"
          />
          <small class="text-red-500 mt-1 block" v-if="emailError">{{ emailError }}</small>
          <div class="text-sm text-surface-600 mt-2">
          <small class="text-surface-500 mt-2 block">
            Only @medtech.tn emails are allowed
          </small>
          </div>
        </div>

        <Button
          label="Send Verification Code"
          size="large"
          class="w-full"
          :loading="loading"
          @click="requestCode"
        />
      </div>

      <!-- Code Verification Step -->
      <div v-if="step === 'code'" class="space-y-6">
        <div class="text-center">
          <div class="flex items-center justify-center mb-4">
            <Avatar :label="email[0].toUpperCase()" size="large" shape="circle" class="mr-3 bg-primary-500 text-white" />
            <div class="text-left">
              <p class="font-medium text-surface-900">{{ email }}</p>
              <p class="text-sm text-surface-600">Enter the 6-digit code</p>
            </div>
          </div>
          
          <p class="text-surface-700 mb-2">
            We sent a verification code to your email
            <span class="font-semibold">{{ email }}</span>
          </p>
          
          <p class="text-sm text-surface-600 mb-6">
            Check your inbox and enter the code below
          </p>
        </div>

        <div class="field">
          <label for="code" class="block text-sm font-medium text-surface-700 mb-2">
            Verification Code
          </label>
          <div class="flex justify-center">
            <InputOtp
              v-model="code"
              :length="6"
              integer-only
              variant="filled"
            />
          </div>
          <small class="text-red-500 mt-1 block" v-if="codeError">{{ codeError }}</small>
        </div>

        <div class="flex gap-3">
          <Button
            label="Back"
            severity="secondary"
            size="large"
            class="flex-1"
            @click="step = 'email'"
          />
          <Button
            label="Verify & Login"
            size="large"
            class="flex-1"
            :loading="loading"
            @click="verifyCode"
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
              @click="resendCode"
            />
          </p>
          <p class="text-xs text-surface-500 mt-2">
            Code expires in 10 minutes
          </p>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="debugCode" class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p class="text-sm text-yellow-800">
          🔐 <strong>Development Mode:</strong> Your code is: 
          <span class="font-mono font-bold">{{ debugCode }}</span>
        </p>
      </div>
    </div>

    <!-- Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import InputOtp from 'primevue/inputotp'
import Toast from 'primevue/toast'

const router = useRouter()
const toast = useToast()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
// State
const step = ref('email')
const email = ref('')
const code = ref('')
const loading = ref(false)
const emailError = ref('')
const codeError = ref('')
const debugCode = ref('')

// Validation
const validateEmail = () => {
  emailError.value = ''
  
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(medtech|smu)\.tn$/i
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please use a valid @medtech.tn email'
    return false
  }
  
  return true
}

// API Calls
const requestCode = async () => {
  if (!validateEmail()) return
  
  loading.value = true
  emailError.value = ''
  
  try {
    const response = await fetch(apiUrl + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })
    
    const data = await response.json()
    
    if (data.success) {
      toast.add({
        severity: 'success',
        summary: 'Code Sent',
        detail: 'Check your email for the verification code',
        life: 3000
      })
      
      debugCode.value = data.debugCode || ''
      step.value = 'code'
      code.value = '' // Reset code input
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: data.message || 'Failed to send code',
        life: 3000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Network Error',
      detail: 'Could not connect to server',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const verifyCode = async () => {
  if (code.value.length !== 6) {
    codeError.value = 'Please enter the 6-digit code'
    return
  }
  
  loading.value = true
  codeError.value = ''
  
  try {
    const response = await fetch(apiUrl + '/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        code: code.value
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Save token and user data
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      toast.add({
        severity: 'success',
        summary: 'Welcome!',
        detail: `Logged in as ${data.data.user.email}`,
        life: 2000
      })
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } else {
      codeError.value = data.message || 'Invalid code'
      toast.add({
        severity: 'error',
        summary: 'Verification Failed',
        detail: data.message || 'Invalid code',
        life: 3000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Network Error',
      detail: 'Could not verify code',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  if (email.value) {
    await requestCode()
  }
}
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

/* Avatar and user info section */
.flex.items-center.justify-center {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.text-left p.font-medium {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.text-left p.text-sm {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Verification message spacing */
.text-center .text-surface-700 {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.text-center .text-surface-600 {
  font-size: 0.9375rem;
  line-height: 1;
  margin-bottom: 1rem;
  margin-top: 1rem;
  color: #6f6b80;
}

/* Code expiration text */
.text-xs {
  font-size: 0.8125rem;
  margin-top: 1rem;
  color: #9ca3af;
}

/* Button spacing */
.p-button {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Debug info styling */
.mt-6 {
  margin-top: 2rem;
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
/* OTP Input Styling */
:deep(.p-inputotp) {
  gap: 0.75rem !important;
}

:deep(.p-inputotp-input) {
  width: 3.5rem !important;
  height: 3.5rem !important;
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  text-align: center !important;
  border-radius: 8px !important;
}

/* Make sure the numbers are visible */
:deep(.p-inputotp-input input) {
  color: #1f2937 !important;
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  text-align: center !important;
}

</style>