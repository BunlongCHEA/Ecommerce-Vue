<template>
  <div class="flex flex-col md:flex-row h-screen w-full overflow-hidden">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Left side animation (similar to LoginPage.vue) -->
    <div class="w-full md:w-3/5 flex items-center justify-end overflow-hidden animation-container">
      <div id="animation-sub" class="w-full h-full flex items-center -ml-4 md:-ml-8">
        <!-- src="/animation-ecommerce.json" -->
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

    <!-- Right side registration form (1 part width) -->
    <div class="w-full md:w-2/5 flex items-center justify-start register-container overflow-y-auto py-4">
      <div class="w-[90%] max-w-md bg-white rounded-xl shadow-lg text-center p-6 sm:p-8 register-card my-auto mx-auto md:mx-0">
        <div class="mb-5">
          <img src="@/assets/ecommerce-logo.webp" alt="Ecommerce Logo" class="w-16 sm:w-24 mx-auto" />
        </div>
        <h2 class="text-xl sm:text-2xl mb-2 text-gray-800">Create Your Account</h2>
        <p class="text-sm text-gray-500 mb-5">Join our community and start shopping today!</p>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- First Name and Last Name (side by side on larger screens) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="text-left">
              <label for="firstName" class="block mb-1 text-sm text-gray-800">First Name</label>
              <input
                type="text"
                id="firstName"
                v-model="firstName"
                placeholder="Enter your first name"
                required
                class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div class="text-left">
              <label for="lastName" class="block mb-1 text-sm text-gray-800">Last Name</label>
              <input
                type="text"
                id="lastName"
                v-model="lastName"
                placeholder="Enter your last name"
                required
                class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <!-- Gender -->
          <div class="text-left">
            <label for="gender" class="block mb-1 text-sm text-gray-800">Gender</label>
            <select 
              id="gender" 
              v-model="gender" 
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option disabled value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Rather not say">Rather not say</option>
            </select>
          </div>
          
          <!-- Phone Number -->
          <div class="text-left">
            <label for="phoneNumber" class="block mb-1 text-sm text-gray-800">Phone Number</label>
            <vue-tel-input
              v-model="phoneNumber"
              :placeholder="'Enter your phone number'"
              :mode="'international'"
              :valid-characters-Only="true"
              :dropdown-options="{ showFlags: true, showDialCodeInSelection: true }"
              class="tel-input-custom"
              required
            />
          </div>
          
          <!-- Username -->
          <div class="text-left">
            <label for="username" class="block mb-1 text-sm text-gray-800">Username</label>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Enter your username to login"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <!-- Email -->
          <div class="text-left">
            <label for="email" class="block mb-1 text-sm text-gray-800">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <!-- Password -->
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
          
          <!-- Confirm Password -->
          <div class="text-left">
            <label for="confirmPassword" class="block mb-1 text-sm text-gray-800">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
              class="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <!-- Submit Button -->
          <div class="flex flex-col gap-2.5 mt-5">
            <button type="submit" class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base cursor-pointer">Register</button>
          </div>
        </form>
        
        <div class="mt-4">
          <p class="text-sm">
            Already have an account?
            <a @click.prevent="navigateToLogin" href="#" class="text-blue-600 hover:underline cursor-pointer">Log in here</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import '@lottiefiles/lottie-player'
import { Vue3Lottie } from 'vue3-lottie'
// import animationData from '@/assets/animation-ecommerce.json'
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'
import 'vue-tel-input/vue-tel-input.css'
import { VueTelInput } from 'vue-tel-input'

// data
const firstName = ref('')
const lastName = ref('')
const gender = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const phoneNumber = ref('') // Full phone number from vue-tel-input (e.g., +123456789)

// const animationUrl = ref('')
const animationData = ref(null)

const router = useRouter()
const loading = ref(false)
const popupRef = ref(null)
const durationWait = 1000 // 1 second

// methods
// onMounted(() => {
//   const blob = new Blob([JSON.stringify(animationData)], { type: 'application/json' })
//   animationUrl.value = URL.createObjectURL(blob)
// })

// Animation loading
onMounted(async () => {
  try {
    console.log('🎬 Loading animation data...')
    const response = await fetch('/animation-ecommerce.json')
    // const response = await fetch('/animation-ecommerce2.json')
    if (response.ok) {
      animationData.value = await response.json()
      console.log('✅ Animation data /animation-ecommerce.json loaded successfully!')
    } else {
      console.error('❌ Failed to load animation data, status:', response.status)
    }
  } catch (error) {
    console.error('❌ Error loading animation data:', error)
  }
})

const handleRegister = async () => {
  loading.value = true

  if (password.value !== confirmPassword.value) {
    console.log('Passwords do not match')
    popupRef.value.show('Passwords do not match', 'error')
    loading.value = false
    return
  }

  try {
    console.log('Phone Number:', phoneNumber.value) // Full phone number

    const response = await api.post('/auth/register', {
      firstName: firstName.value,
      lastName: lastName.value,
      gender: gender.value,
      username: username.value,
      email: email.value,
      password: password.value,
      role: 'User',
      phoneNumber: phoneNumber.value, // Send full phone number
    })
    popupRef.value.show('Registration successful', 'success')

    // simulate loading delay
    setTimeout(() => {
      loading.value = false
      // Redirect to login
      router.push('/')
    }, durationWait)
  } catch (error) {
    loading.value = false

    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'

    if (errorMessage.includes('Username')) {
      console.log('Username already taken')
      popupRef.value.show('The Username is already taken. Please choose a different one.', 'error')
    } else if (errorMessage.includes('Email')) {
      console.log('Email already registered')
      popupRef.value.show('The Email is already registered. Please use a different one.', 'error')
    } else {
      console.log('Registration failed:', errorMessage)
      popupRef.value.show(errorMessage, 'error')
    }

    // popupRef.value.show(
    //   error.response?.data?.message || 'Registration failed. Please try again.',
    //   'error',
    // )
  }
}

const navigateToLogin = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/')
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

/* Maintain base styles consistent with LoginPage */
.register-container, .animation-container {
  transition: all 0.3s ease;
  /* max-height: 100vh; */
}

/* .register-card {
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
} */

/* Custom styles for vue-tel-input to work with Tailwind without using @apply */
:deep(.tel-input-custom) {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

:deep(.tel-input-custom:focus-within) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

:deep(.vue-tel-input input) {
  border: none;
  padding: 0.625rem;
  font-size: 0.875rem;
  outline: none;
  background-color: transparent;
  min-height: 40px;
}

:deep(.vti__dropdown) {
  border: none;
  background-color: transparent;
}

:deep(.vti__dropdown:hover) {
  background-color: #f3f4f6;
}

/* Applied styles when body has high-zoom class (JavaScript detection) */
:global(body.high-zoom) .animation-container {
  display: none;
}

:global(body.high-zoom) .register-container {
  width: 100% !important;
  justify-content: center !important;
  padding: 1rem;
}

/* Media query fallback for browsers that support it */
@media (min-resolution: 1.75dppx), (max-width: 1200px) {
  .animation-container {
    display: none;
  }
  
  .register-container {
    width: 100% !important;
    justify-content: center !important;
    padding: 1rem;
    overflow-y: auto;
  }
}

/* Ensure form fits on higher zoom levels */
@media screen and (min-width: 640px) and (max-height: 700px) {
  .register-card {
    padding: 1rem;
  }
  
  .register-container {
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
}
</style>