<template>
  <div class="flex flex-col md:flex-row h-screen w-full overflow-hidden">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Header over both sections with bold background -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-slate-800 shadow-lg">
      <div class="flex justify-between items-center px-6 py-4">
        <h1 class="text-2xl font-bold text-white">Reset Password</h1>
        <div class="flex gap-3">
          <router-link 
            to="/login" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register" 
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign Up
          </router-link>
        </div>
      </div>
    </div>

    <!-- Left side image (2/3 width) - content below header -->
    <div class="w-full md:w-2/3 flex items-center justify-center overflow-hidden bg-blue-50 pt-20">
      <div class="w-full h-full flex flex-col items-center justify-center p-8">
        <img 
          src="@/assets/forgot-password.svg" 
          alt="Forgot Password" 
          class="w-full h-auto max-w-lg mb-6"
        />
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Forgot Your Password?</h2>
          <p class="text-lg text-gray-600">Don't worry, we'll help you reset it quickly and securely</p>
        </div>
      </div>
    </div>

    <!-- Right side form (1/3 width) - content below header -->
    <div class="w-full md:w-1/3 flex items-center justify-center pt-20">
      <div class="w-[90%] max-w-md bg-white rounded-xl shadow-lg text-center p-6 sm:p-8">
        <div class="mb-5">
          <img src="@/assets/ecommerce-logo.webp" alt="Ecommerce Logo" class="w-16 sm:w-24 mx-auto" />
        </div>
        <h2 class="text-xl sm:text-2xl mb-2 text-gray-800">Forgot Password?</h2>
        <p class="text-sm text-gray-500 mb-5">Enter your email address and we'll send you a link to reset your password</p>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="text-left">
            <label for="email" class="block mb-1 text-sm text-gray-800">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email address"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div class="flex flex-col gap-2.5 mt-5">
            <button 
              type="submit" 
              :disabled="isLoading"
              class="py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-base cursor-pointer"
            >
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>
        </form>
        
        <div class="mt-4">
          <router-link to="/login" class="text-blue-600 hover:underline">Back to Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const email = ref('')
const popupRef = ref(null)
const router = useRouter()
const durationWait = 1000 // 1 second
const loading = ref(false)

const handleSubmit = async () => {
  if (!email.value) {
    popupRef.value?.show('Please enter your email address.', 'error')
    return
  }

  loading.value = true

  try {
    const clientUrl = window.location.origin // Gets the current domain

    // const testResponse = await api.post('/test/sendgrid-direct-test', {
    //   email: email.value
    // })

    const response = await api.post('/auth/forgot-password', {
      email: email.value,
      clientUrl
    })

    // console.log('Test email response: ', testResponse.data)
    console.log('clientUrl: ', clientUrl)
    console.log('Forgot password response: ', response.data)
    console.log('response.data.details: ', response.data.details)
    
    // Simulate loading delay to redirect to Reset Password page
    setTimeout(() => {
      router.push({
        name: 'ResetPasswordSent',
        query: { email: email.value }
      })
      loading.value = false
    }, durationWait)
    
  } catch (error) {
    popupRef.value?.show(error.response?.data?.message || 'Failed to send reset email. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

</style>
