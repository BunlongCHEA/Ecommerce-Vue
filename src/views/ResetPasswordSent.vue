<template>
  <div class="flex flex-col md:flex-row h-screen w-full overflow-hidden">
    <!-- <LoadingOverlay :show="isLoading" /> -->
    <PopupMessage ref="popupRef" />

    <!-- Header over both sections with bold background -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-slate-800 shadow-lg">
      <div class="flex justify-between items-center px-6 py-4">
        <h1 class="text-2xl font-bold text-white">Check Your Email</h1>
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
    <div class="w-full md:w-2/3 flex items-center justify-center overflow-hidden bg-green-50 pt-20">
      <div class="w-full h-full flex flex-col items-center justify-center p-8">
        <div class="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div class="text-center">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Email Sent Successfully!</h2>
          <p class="text-xl text-gray-600 mb-4">We've sent a password reset link to your email</p>
          <p class="text-lg text-gray-500">Check your inbox and follow the instructions</p>
        </div>
      </div>
    </div>

    <!-- Right side form (1/3 width) - content below header -->
    <div class="w-full md:w-1/3 flex items-center justify-center pt-20">
      <div class="w-[90%] max-w-md bg-white rounded-xl shadow-lg text-center p-6 sm:p-8">
        <div class="mb-5">
          <img src="@/assets/ecommerce-logo.webp" alt="Ecommerce Logo" class="w-16 sm:w-24 mx-auto" />
        </div>
        <h2 class="text-xl sm:text-2xl mb-2 text-gray-800">Check Your Email</h2>
        <p class="text-sm text-gray-500 mb-5">
          We have sent a password reset link to 
          <span class="font-medium text-gray-700">{{ email }}</span>
        </p>
        
        <div class="space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p class="font-medium mb-2">Didn't receive the email?</p>
            <ul class="text-left space-y-1">
              <li>• Check your spam folder</li>
              <li>• Make sure the email address is correct</li>
              <li>• Wait a few minutes for delivery</li>
            </ul>
          </div>
          
          <div class="flex flex-col gap-2.5">
            <button 
              @click="resendEmail" 
              :disabled="isLoading"
              class="py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-base cursor-pointer"
            >
              {{ isLoading ? 'Resending...' : 'Resend Email' }}
            </button>
          </div>
        </div>
        
        <div class="mt-4">
          <router-link to="/login" class="text-blue-600 hover:underline">Back to Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PopupMessage from '@/components/PopupMessage.vue'
import api from '@/services/api'

const route = useRoute()
const email = ref('')
const popupRef = ref(null)

onMounted(() => {
  email.value = route.query.email || ''
})

const resendEmail = async () => {
  if (!email.value) {
    popupRef.value?.show('Email address not found. Please go back and try again.', 'error')
    return
  }

  try {
    const clientUrl = window.location.origin

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

    popupRef.value?.show('Reset link sent successfully!', 'success')
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to resend email. Please try again.'
    popupRef.value?.show(errorMessage || 'Failed to resend email. Please try again.', 'error')
  }
}
</script>