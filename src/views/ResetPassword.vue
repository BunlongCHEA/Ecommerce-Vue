<template>
  <div class="flex flex-col md:flex-row h-screen w-full overflow-hidden">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Header over both sections with bold background -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-slate-800 shadow-lg">
      <div class="flex justify-between items-center px-6 py-4">
        <h1 class="text-2xl font-bold text-white">Create New Password</h1>
        <div class="flex gap-3">
          <button 
            @click="navigateToLogin"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>

          <button 
            @click="navigateToRegister"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>

    <!-- Left side image (2/3 width) - content below header -->
    <div class="w-full md:w-2/3 flex items-center justify-center overflow-hidden bg-purple-50 pt-20">
      <div class="w-full h-full flex flex-col items-center justify-center p-8">
        <div class="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2l-4-4 2.257-2.257A6 6 0 0117 9z"/>
          </svg>
        </div>
        <div class="text-center">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Create New Password</h2>
          <p class="text-xl text-gray-600 mb-4">Choose a strong and secure password</p>
          <p class="text-lg text-gray-500">Make sure it's something you'll remember</p>
        </div>
      </div>
    </div>

    <!-- Right side form (1/3 width) - content below header -->
    <div class="w-full md:w-1/3 flex items-center justify-center pt-20">
      <div class="w-[90%] max-w-md bg-white rounded-xl shadow-lg text-center p-6 sm:p-8">
        <div class="mb-5">
          <img src="@/assets/ecommerce-logo.webp" alt="Ecommerce Logo" class="w-16 sm:w-24 mx-auto" />
        </div>
        <h2 class="text-xl sm:text-2xl mb-2 text-gray-800">Reset Password</h2>
        <p class="text-sm text-gray-500 mb-5">Enter your new password below</p>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="text-left">
            <label for="newPassword" class="block mb-1 text-sm text-gray-800">New Password</label>
            <input
              type="password"
              id="newPassword"
              v-model="newPassword"
              placeholder="Enter new password"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div class="text-left">
            <label for="confirmPassword" class="block mb-1 text-sm text-gray-800">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm new password"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div class="bg-gray-50 p-3 rounded-lg text-left text-xs text-gray-600">
            <p class="font-medium mb-1">Password requirements:</p>
            <ul class="space-y-1">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
              <li>• One special character</li>
            </ul>
          </div>
          
          <div class="flex flex-col gap-2.5 mt-5">
            <button 
              type="submit" 
              :disabled="isLoading"
              class="py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-base cursor-pointer"
            >
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>
        </form>
        
        <div class="mt-4">
          <!-- <router-link to="/login" class="text-blue-600 hover:underline">Back to Login</router-link> -->
           <button 
            @click="navigateToLogin"
            class="text-blue-600 hover:underline"
          >Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const newPassword = ref('')
const confirmPassword = ref('')

const popupRef = ref(null)
const durationWait = 1000 // 1 second
const loading = ref(false)

const email = ref('')
const token = ref('')

const isFormValid = computed(() => {
  return newPassword.value.length >= 6 && 
         confirmPassword.value.length >= 6 && 
         newPassword.value === confirmPassword.value
})

onMounted(() => {
  email.value = route.query.email || ''
  token.value = route.query.token || ''

  if (!email.value || !token.value) {
    popupRef.value?.show('Invalid reset link. Please request a new password reset.', 'error')
    setTimeout(() => {
      router.push('/forgot-password')
    }, 3000)

    // setTimeout(() => {
    //   router.push('/forgot-password')
    //   loading.value = false
    // }, durationWait)
  }
})

const handleSubmit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    popupRef.value?.show('Passwords do not match.', 'error')
    return
  }

  if (newPassword.value.length < 6) {
    popupRef.value?.show('Password must be at least 6 characters long.', 'error')
    return
  }

  loading.value = true

  try {
    console.log('Email:', email.value)
    console.log('Token:', token.value)
    console.log('New Password:', newPassword.value)
    console.log('Confirm Password:', confirmPassword.value)

    // await authApi.resetPassword(email.value, token.value, newPassword.value, confirmPassword.value)
    const response = await api.post('/auth/reset-password', {
        email: email.value,
        token: token.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
    })
    
    console.log('Reset password response: ', response.data)

    popupRef.value?.show('Password reset successfully! Redirecting to sign in...', 'success')
    
    setTimeout(() => {
      router.push('/')
      loading.value = false
    }, durationWait)

  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to resend email. Please try again.'
    popupRef.value?.show(errorMessage || 'Failed to reset password. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// --- Navigate Router ---

const navigateToLogin = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/')
    loading.value = false
  }, durationWait)
}

const navigateToRegister = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/register')
    loading.value = false
  }, durationWait)
}
</script>