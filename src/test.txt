<template>
  <div class="register-container">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Left Column: Animation -->
    <div class="animation-column">
      <div class="animation-wrapper">
        <!-- <img src="@/assets/ecommerce-animation.svg" alt="Ecommerce Animation" /> -->
        <!-- Alternatively, use Lottie animation -->
        <lottie-player
          :src="animationUrl"
          background="transparent"
          speed="1"
          loop
          autoplay
        ></lottie-player>
      </div>
    </div>

    <!-- Right Column: Registration Form -->
    <div class="form-section">
      <div class="form-card">
        <h2>Create Your Account</h2>
        <p class="subtitle">Join our community and start shopping today!</p>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              v-model="firstName"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              v-model="lastName"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div class="form-group">
            <label for="gender">Gender</label>
            <select id="gender" v-model="gender" required>
              <option disabled value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Rather not say">Rather not say</option>
            </select>
          </div>

          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <vue-tel-input
              v-model="phoneNumber"
              :placeholder="'Enter your phone number'"
              :mode="'international'"
              :valid-characters-Only="true"
              :dropdown-options="{ showFlags: true, showDialCodeInSelection: true }"
              required
            />
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Enter your username to login"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Enter your email"
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

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" class="register-button">Register</button>
        </form>
        <div class="login-link"></div>
        <p>
          Already have an account?
          <a @click.prevent="navigateToLogin" href="#">Log in here</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@lottiefiles/lottie-player'
import animationData from '@/assets/animation-ecommerce.json'
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

const animationUrl = ref('')
const router = useRouter()
const loading = ref(false)
const popupRef = ref(null)
const durationWait = 1000 // 1 second

// methods
onMounted(() => {
  const blob = new Blob([JSON.stringify(animationData)], { type: 'application/json' })
  animationUrl.value = URL.createObjectURL(blob)
})

const handleRegister = async () => {
  loading.value = true

  if (password.value !== confirmPassword.value) {
    // showPopupMessage('Passwords do not match')
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
      popupRef.value.show('The Username is already taken. Please choose a different one.', 'error')
    } else if (errorMessage.includes('Email')) {
      popupRef.value.show('The Email is already registered. Please use a different one.', 'error')
    } else {
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
    loading.value = false
    router.push('/')
  }, durationWait)
}
</script>

<style scoped>
/* Whole body in fit window (no overflow) */
/* :global(html, body) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(to bottom, #0080ff, #e9ecef);
}

:global(#app) {
  height: 100%;
  background: linear-gradient(to bottom, #0080ff, #e9ecef);
} */

.register-container {
  display: flex;
  flex-wrap: nowrap;
  /* min-height: 100vh; */
  height: auto;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}

/* Left Column: Animation */
.animation-column {
  flex: 1.5;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
  color: white;
}

/* .animation-wrapper lottie-player {
  max-width: 80%;
  height: auto;
} */

/* Right section: Registration Form */
.form-section {
  flex: 1;
  display: flex;
  justify-content: left;
  align-items: center;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
  /* add breathing room */
  /* padding: 20px; */
  /* box-sizing: border-box; */
  /* full screen height */
  /* height: 100vh; */
  /* don't allow it to spill */
  /* overflow: hidden; */
}

.form-card {
  width: 100%;
  max-width: auto;
  max-height: 90vh;
  height: auto;
  /* overflow-y: auto; */
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
}

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

input,
select,
.vue-tel-input input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.vue-tel-input input {
  padding-right: 45px; /* Adjust for country code dropdown */
}

input:focus,
select:focus,
.vue-tel-input input:focus {
  border-color: #007bff;
  box-shadow: 0 0 3px rgba(0, 123, 255, 0.5);
}

/* Ensure dropdown of vue-tel-input is aligned */
.vue-tel-input {
  width: 100%;
}

/* Button styles */
.register-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.register-button:hover {
  background-color: #0056b3;
}

.login-link {
  margin-top: 15px;
  font-size: 14px;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}

.login-link a:hover {
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
  .form-card {
    padding: 20px;
    max-height: 95vh;
  }
  input,
  select {
    font-size: 13px;
    padding: 8px;
  }
  .register-button {
    font-size: 15px;
  }
  .form-card {
    width: 100%;
    height: 200px;
    overflow-y: auto;
  }
}
</style>
