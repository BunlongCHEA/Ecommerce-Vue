<template>
  <div class="forgot-password-page">
    <!-- Top Menu -->
    <header class="top-menu">
      <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      <nav class="nav-links">
        <a href="/">Sign In</a>
        <a href="/register">Register</a>
      </nav>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left: Image -->
      <div class="image-section">
        <img src="@/assets/forgot-password.svg" alt="Forgot Password" />
      </div>

      <!-- Right: Forgot Password Form -->
      <div class="form-section">
        <h2>Forgot Password</h2>
        <form @submit.prevent="handleSubmit">
          <label for="email">Enter your email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            required
            placeholder="your.name@gmail.com"
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <PopupMessage ref="popupRef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PopupMessage from '@/components/PopupMessage.vue'
import { useRouter } from 'vue-router'

const email = ref('')
const popupRef = ref(null)
const router = useRouter()
const durationWait = 1000 // 1 second

const handleSubmit = async () => {
  try {
    const found = email.value === 'user@example.com'

    if (found) {
      setTimeout(() => {
        loading.value = false
        // Redirect to reset-password-sent page
        router.push('/reset-password-sent')
      }, durationWait)
    } else {
      popupRef.value?.show('Email not found. Please try again.', 'error')
    }
  } catch (err) {
    popupRef.value?.show('Something went wrong.', 'error')
  }
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
  overflow-y: auto;
} */

.forgot-password-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* overflow: hidden; */
  width: 100%;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}

/* Top Menu */
.top-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  background-color: #6a00ff;
  /* background: linear-gradient(to bottom, #054ff0, #ffffff); */
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.logo {
  height: 40px;
  width: auto;
}

/* Nav Links */
.nav-links a {
  margin-left: 24px;
  text-decoration: none;
  color: white;
  font-weight: 500;
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  /* overflow: hidden; */
}
/* End Top Menu */

/* Image Section */
.image-section {
  flex: 1.5;
  background-color: #f5f5f5;
  /* background-color: #00eeff; */
  display: flex;
  justify-content: center;
  align-items: center;
  /* overflow: hidden; */
}

.image-section img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
/* End Image Section */

/* Form Section */
.form-section {
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: white;
  box-sizing: border-box;
  /* overflow: hidden; */
}

.form-section h2 {
  margin-bottom: 24px;
  font-size: 24px;
}

.form-section label {
  margin-bottom: 8px;
  font-weight: 500;
}

.form-section input {
  padding: 10px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
}

.form-section button {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  transition: background-color 0.3s;
}

.form-section button:hover {
  background-color: #0056b3;
}

/* 📱 Responsive for smaller screens */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .image-section {
    display: none; /* optional: hide image on small screens */
  }

  .form-section {
    width: 100%;
    height: 200px;
    overflow-y: auto;
  }
}
</style>
