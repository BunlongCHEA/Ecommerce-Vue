<template>
  <div class="flex flex-col md:flex-row h-screen w-full overflow-hidden">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Right side animation (2/3 width) with justify-content: right -->
    <div class="w-full md:w-2/3 flex items-center justify-end overflow-hidden animation-container">
      <div id="animation-sub" class="w-full h-full flex items-center -ml-4 md:-ml-8">
        <!-- src="/animation-ecommerce.json"  --  :src="animationUrl" -->
        <!-- <lottie-player
          src="/animation-ecommerce.json"
          background="transparent"
          speed="1"
          loop
          autoplay
          class="bg-transparent w-[110%] h-auto max-w-none"
        ></lottie-player> -->
        <Vue3Lottie
          v-if="animationData"
          :animation-data="animationData"
          :background="transparent"
          :speed="1"
          :loop="true"
          :autoplay="true"
          class="bg-transparent w-[110%] h-auto max-w-none"
        />
        <!-- Fallback while loading -->
        <!-- <div v-else class="bg-transparent w-[110%] h-auto max-w-none flex items-center justify-center">
          <div class="text-gray-400">Loading animation...</div>
        </div> -->
      </div>
    </div>

    <!-- Left side login form (1/3 width) -->
    <div id="login" class="w-full md:w-1/3 flex items-center justify-start login-container">
      <div class="w-[90%] max-w-md bg-white rounded-xl shadow-lg text-center p-6 sm:p-8">
        <div class="mb-5">
          <img src="@/assets/ecommerce-logo.webp" alt="Ecommerce Logo" class="w-16 sm:w-24 mx-auto" />
        </div>
        <h2 class="text-xl sm:text-2xl mb-2 text-gray-800">Welcome Back!</h2>
        <p class="text-sm text-gray-500 mb-5">Log in to your account to continue shopping</p>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="text-left">
            <label for="username" class="block mb-1 text-sm text-gray-800">Username</label>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Enter your username"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div class="text-left">
            <label for="password" class="block mb-1 text-sm text-gray-800">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div class="flex flex-col gap-2.5 mt-5">
            <button type="submit" class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base cursor-pointer">Login</button>
            <button type="button" @click="navigateToRegister" class="py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-base cursor-pointer">
              Create Account
            </button>
          </div>
        </form>
        <div class="mt-4">
          <!-- <router-link to="/forgot-password" class="text-blue-600 hover:underline">Forgot your password?</router-link> -->
          <button @click="navigateToForgotPassword" class="text-blue-600 hover:underline">Forgot your password?</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api, { setAuthToken } from '@/services/api'
// import '@lottiefiles/lottie-player'
import { Vue3Lottie } from 'vue3-lottie'
// import animationData from '@/assets/animation-ecommerce.json'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'

// Data
// const email = ref('')
const username = ref('')
const password = ref('')
// const animationUrl = ref('')
const animationData = ref(null)
const router = useRouter()
const loading = ref(false)
// const showMessage = ref(false)
// const messageText = ref('')
// const messageType = ref('success') // 'success' or 'error'
const popupRef = ref(null)
const durationWait = 1000 // 1 second

// Methods
// onMounted(() => {
//   const blob = new Blob([JSON.stringify(animationData)], { type: 'application/json' })
//   animationUrl.value = URL.createObjectURL(blob)
// })

// Animation loading
onMounted(async () => {
  try {
    console.log('🎬 Loading animation data...')
    const response = await fetch('/animation-shopping.json')
    // const response = await fetch('https://assets10.lottiefiles.com/packages/lf20_1a8dx7zj.json')
    if (response.ok) {
      animationData.value = await response.json()
      console.log('Animation data /animation-ecommerce.json loaded successfully!')
    } else {
      console.error('Failed to load animation data, status:', response.status)
    }
  } catch (error) {
    console.error('Error loading animation data:', error)
  }
})

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    })
    const { token, userId, role } = response.data // Assuming the API returns both token and userId
    // const token = response.data.token

    // Debugging: Log token and userId to the console
    // console.log('Response:', response.data)

    // Create JSON object and encode it in Base64
    const userData = btoa(JSON.stringify({ userId, role }))

    // Clear any old token and store the new one
    localStorage.removeItem('authToken') // Clear old token
    localStorage.setItem('authToken', token) // Save new token
    localStorage.setItem('ecommerce_dotnet_userData', userData) // Save encoded user data
    // localStorage.setItem('ecommerce_dotnet_userId', userId)
    // localStorage.setItem('ecommerce_dotnet_role', role) // Save user role

    document.cookie = `ecommerce_dotnet_userData=${userData}; path=/; max-age=86400` // Cookie valid for 1 day
    // document.cookie = `ecommerce_dotnet_userId=${userId}; path=/; max-age=86400` // Cookie valid for 1 day
    // document.cookie = `ecommerce_dotnet_role=${role}; path=/; max-age=86400` // Cookie valid for 1 day

    // Debugging: Verify values saved in localStorage  && cookie
    console.log('Saved LocalStorage:', {
      authToken: localStorage.getItem('authToken'),
      userData: localStorage.getItem('ecommerce_dotnet_userData'),
    })
    console.log('Saved Cookie:', document.cookie)

    setAuthToken(token) // Set the token in the API service

    // Simulate loading delay
    setTimeout(() => {
      router.push('/product')
      loading.value = false
    }, durationWait)
  } catch (error) {
    popupRef.value.show(error.response?.data?.message || 'Login failed. Please try again.', 'error')
    loading.value = false
  }
}

const navigateToRegister = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/register')
    loading.value = false
  }, durationWait)
}

const navigateToForgotPassword = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/forgot-password')
    loading.value = false
  }, durationWait)
}
</script>

<style scoped>
#animation-sub {
  justify-content: right;
}

#login {
  justify-content: left;
}


/* Base styles */
.login-container, .animation-container {
  transition: all 0.3s ease;
  /* max-height: 100vh; */
}

/* Applied styles when body has high-zoom class (JavaScript detection) */
:global(body.high-zoom) .animation-container {
  display: none;
}

:global(body.high-zoom) .login-container {
  width: 100% !important;
  justify-content: center !important;
  padding: 1rem;
}

/* Media query fallback for browsers that support it */
@media (min-resolution: 1.75dppx), (max-width: 1200px) {
  .animation-container {
    display: none;
  }
  
  .login-container {
    width: 100% !important;
    /* height: auto; */
    justify-content: center !important;
    padding: 1rem;
    overflow-y: auto;
  }

  /* :global(html, body) {
    overflow-y: scroll;
  } */
}

/* Ensure form fits on higher zoom levels */
@media screen and (min-width: 640px) and (max-height: 700px) {
  .login-card {
    padding: 1rem;
  }
  
  .login-container {
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}
</style>