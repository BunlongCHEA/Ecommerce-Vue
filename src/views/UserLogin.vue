<template>
  <div class="login-wrapper">
    <LoadingOverlay :show="loading" />
    <!-- <div v-if="showMessage" :class="['popup-message', messageType]">
      {{ messageText }}
    </div> -->
    <PopupMessage ref="popupRef" />

    <!-- Left side animation src="https://assets3.lottiefiles.com/packages/lf20_jcikwtux.json" -->
    <div class="animation-column">
      <div class="animation-wrapper">
        <lottie-player
          :src="animationUrl"
          background="transparent"
          speed="1"
          loop
          autoplay
        ></lottie-player>
      </div>
    </div>

    <!-- Right side login form -->
    <div class="login-section">
      <div class="login-card">
        <div class="brand-logo">
          <img src="@/assets/ecommerce-logo.webp" alt="Ecommerce Logo" />
        </div>
        <h2>Welcome Back!</h2>
        <p class="subtitle">Log in to your account to continue shopping</p>
        <form @submit.prevent="handleLogin">
          <!-- <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
              required
            />
          </div> -->
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Enter your username"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div class="form-actions">
            <button type="submit" class="login-button">Login</button>
            <button type="button" @click="navigateToRegister" class="register-button">
              Create Account
            </button>
          </div>
        </form>
        <!-- <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p> -->
        <div class="forgot-password">
          <router-link to="/forgot-password">Forgot your password?</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api, { setAuthToken } from '@/services/api'
import '@lottiefiles/lottie-player'
import animationData from '@/assets/animation-ecommerce.json'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'

// Data
// const email = ref('')
const username = ref('')
const password = ref('')
const animationUrl = ref('')
const router = useRouter()
const loading = ref(false)
// const showMessage = ref(false)
// const messageText = ref('')
// const messageType = ref('success') // 'success' or 'error'
const popupRef = ref(null)
const durationWait = 1000 // 1 second

// Methods
onMounted(() => {
  const blob = new Blob([JSON.stringify(animationData)], { type: 'application/json' })
  animationUrl.value = URL.createObjectURL(blob)
})

// Show message and stop loading
// const showPopupMessage = (text, type = 'error') => {
//   loading.value = false
//   messageText.value = text
//   messageType.value = type
//   showMessage.value = true

//   setTimeout(() => {
//     showMessage.value = false
//   }, 3000)
// }

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    })
    const { token, userId } = response.data // Assuming the API returns both token and userId
    // const token = response.data.token

    // Debugging: Log token and userId to the console
    console.log('Response:', response.data)

    // Clear any old token and store the new one
    localStorage.removeItem('authToken') // Clear old token
    localStorage.setItem('authToken', token) // Save new token
    localStorage.setItem('userId', userId)
    document.cookie = `userId=${userId}; path=/; max-age=86400` // Cookie valid for 1 day

    // Debugging: Verify values saved in localStorage  && cookie
    console.log('Saved Token in localStorage:', localStorage.getItem('authToken'))
    console.log('Saved User ID in localStorage:', localStorage.getItem('userId'))
    console.log('Saved Cookie:', document.cookie)

    setAuthToken(token) // Set the token in the API service

    // Simulate loading delay
    setTimeout(() => {
      loading.value = false
      router.push('/product')
    }, durationWait)
  } catch (error) {
    popupRef.value.show(error.response?.data?.message || 'Login failed. Please try again.', 'error')
    loading.value = false
  }
}

const navigateToRegister = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/register')
  }, durationWait)
}
</script>

<style scoped>
/* Whole body in fit window (no overflow) */
:global(html, body) {
  /* margin: 0; */
  /* padding: 0; */
  /* height: 100%; */
  /* overflow-y: scroll; */
  /* overflow-x: scroll; */
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}

/* :global(#app) {
  height: 100%;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
} */

.login-wrapper {
  display: flex;
  flex-wrap: nowrap;
  /* min-height: 100vh; */
  height: auto;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}

/* Left animation panel */
.animation-column {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}

/* .animation-wrapper lottie-player {
  width: 100%;
  max-width: 500px;
} */

/* Right login form */
.login-section {
  flex: 1;
  display: flex;
  justify-content: left;
  align-items: center;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.brand-logo img {
  width: 100px;
  margin-bottom: 20px;
}

/* Pop-Up Message */
/* .popup-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  color: white;
  background-color: #333;
  opacity: 0.95;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeSlideDown 0.3s ease-in-out;
}

.popup-message.success {
  background-color: #28a745;
}

.popup-message.error {
  background-color: #dc3545;
}

@keyframes fadeSlideDown {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
} */

/* Text styles */
h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}

.form-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Button styles */
.login-button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #0056b3;
}

.register-button {
  padding: 10px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.register-button:hover {
  background-color: #5a6268;
}

.error-message {
  margin-top: 10px;
  color: red;
  font-size: 14px;
}

.forgot-password {
  margin-top: 15px;
}

.forgot-password a {
  color: #007bff;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media screen and (max-width: 1200px) {
  .animation-column {
    display: none; /* Hide animation on small screens */
  }
  .form-column {
    flex: 1 1 100%;
  }
  .login-card {
    width: 100%;
    height: 200px;
    overflow-y: auto;
  }
}
</style>
