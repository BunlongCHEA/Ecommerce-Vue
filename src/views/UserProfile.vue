<template>
  <div class="flex flex-col w-full min-h-screen bg-gray-50">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Fixed hamburger menu container -->
    <div class="fixed top-0 left-0 z-40 h-16 w-16 flex items-center justify-center">
      <HamburgerMenu @menu-toggle="handleMenuToggle" />
    </div>

    <!-- Header Section with margin-left to make space for hamburger button -->
    <div 
    class="flex justify-between items-center w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-in-out"
    :class="{ 'translate-x-64': isMenuOpen }"
    >
        <!-- Left: Back Button with margin to avoid hamburger overlap -->
        <div class="flex items-center gap-4 ml-16">
            <button 
            @click="navigateToProduct"
            class="flex items-center text-white hover:text-gray-200 transition-colors"
            >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span class="text-lg font-medium">User Profile</span>
            </button>
        </div>

        <!-- Right: User Profile Info -->
        <div class="flex items-center gap-5">
            <div class="text-white text-right">
            <p class="text-sm">{{ userProfile.firstName }} {{ userProfile.lastName }}</p>
            <p class="text-xs opacity-75">{{ userProfile.role }}</p>
            </div>
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
            {{ userProfile.firstName?.charAt(0)?.toUpperCase() || '👤' }}
            </div>
        </div>
    </div>

    <!-- Main Content with transition effect -->
    <div 
      class="flex flex-col w-full transition-all duration-500 ease-in-out p-4"
      :class="{ 'translate-x-64': isMenuOpen }"
    >
      <!-- Profile Content -->
      <div class="flex flex-row gap-5">
        <!-- Left Side: Profile Navigation -->
        <div class="sticky top-0 max-h-[calc(100vh-1rem)] overflow-y-auto w-[250px] shrink-0 bg-white rounded-lg shadow-sm p-4">
          <h3 class="text-lg font-medium mb-4 text-gray-800">Profile Menu</h3>
          
          <!-- Profile Navigation Items -->
          <div class="space-y-2">
            <button
              @click="activeTab = 'info'"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg transition-colors',
                activeTab === 'info' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Personal Info
              </div>
            </button>

            <button
              @click="activeTab = 'edit'"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg transition-colors',
                activeTab === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Profile
              </div>
            </button>

            <button
              @click="activeTab = 'password'"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg transition-colors',
                activeTab === 'password' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Change Password
              </div>
            </button>
          </div>

          <!-- Profile Stats -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Account Info</h4>
            <div class="space-y-1 text-xs text-gray-600">
              <p>Member since: {{ formatDate(userProfile.createdAt) }}</p>
              <p>User ID: {{ userProfile.id }}</p>
              <p v-if="userProfile.storeId">Store ID: {{ userProfile.storeId }}</p>
            </div>
          </div>
        </div>

        <!-- Right Side: Profile Content -->
        <div class="flex-1">
          <!-- Loading indicator -->
          <div v-if="loading" class="flex justify-center my-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <!-- Personal Info Tab -->
          <div v-if="!loading && activeTab === 'info'" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
            
            <!-- Profile Avatar Section -->
            <div class="flex items-center mb-8">
              <div class="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6">
                {{ userProfile.firstName?.charAt(0)?.toUpperCase() || '👤' }}
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ userProfile.firstName }} {{ userProfile.lastName }}
                </h3>
                <p class="text-gray-600">{{ userProfile.userName }}</p>
                <span class="inline-block px-3 py-1 text-sm font-medium rounded-full mt-2"
                      :class="userProfile.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
                  {{ userProfile.role }}
                </span>
              </div>
            </div>

            <!-- User Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ userProfile.email }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ userProfile.phoneNumber || 'Not provided' }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ userProfile.gender }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ userProfile.firstName }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ userProfile.lastName }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-gray-900">{{ userProfile.userName }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Profile Tab -->
          <div v-if="!loading && activeTab === 'edit'" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            
            <form @submit.prevent="updateProfile" class="space-y-6">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  v-model="editForm.phoneNumber"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Error Message -->
              <div v-if="editErrorMessage" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ editErrorMessage }}
              </div>

              <!-- Success Message -->
              <div v-if="editSuccessMessage" class="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {{ editSuccessMessage }}
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  :disabled="isEditLoading"
                >
                  {{ isEditLoading ? 'Updating...' : 'Update Profile' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Change Password Tab -->
          <div v-if="!loading && activeTab === 'password'" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
            
            <form @submit.prevent="changePassword" class="space-y-6 max-w-md">
              <!-- Current Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <!-- New Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minlength="6"
                />
                <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': passwordMismatch }"
                  required
                />
                <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Passwords do not match</p>
              </div>

              <!-- Error Message -->
              <div v-if="passwordErrorMessage" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ passwordErrorMessage }}
              </div>

              <!-- Success Message -->
              <div v-if="passwordSuccessMessage" class="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {{ passwordSuccessMessage }}
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  :disabled="isPasswordLoading || passwordMismatch || !isPasswordFormValid"
                >
                  {{ isPasswordLoading ? 'Changing...' : 'Change Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import api from '@/services/api'

const router = useRouter()
const userProfile = ref({})
const activeTab = ref('info')
const loading = ref(true)
const isMenuOpen = ref(false)
const durationWait = 1000 // 1 second

// Edit Profile Form
const editForm = ref({
  email: '',
  phoneNumber: ''
})
const isEditLoading = ref(false)
const editErrorMessage = ref('')
const editSuccessMessage = ref('')

// Password Form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isPasswordLoading = ref(false)
const passwordErrorMessage = ref('')
const passwordSuccessMessage = ref('')

const popupRef = ref(null)

// Computed properties
const passwordMismatch = computed(() => {
  return passwordForm.value.newPassword !== passwordForm.value.confirmPassword && 
         passwordForm.value.confirmPassword.length > 0
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword.length > 0 &&
         passwordForm.value.newPassword.length >= 6 &&
         passwordForm.value.confirmPassword.length > 0 &&
         !passwordMismatch.value
})

onMounted(async () => {
  await loadUserProfile()
})

const loadUserProfile = async () => {
  try {
    loading.value = true
    const response = await api.get('/auth')
    userProfile.value = response.data
    
    // Initialize edit form
    editForm.value.email = userProfile.value.email || ''
    editForm.value.phoneNumber = userProfile.value.phoneNumber || ''
  } catch (error) {
    console.error('Failed to load user profile:', error)
    popupRef.value?.showMessage('Failed to load user profile', 'error')
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  isEditLoading.value = true
  editErrorMessage.value = ''
  editSuccessMessage.value = ''

  try {
    await api.put('/auth', editForm.value)
    editSuccessMessage.value = 'Profile updated successfully!'
    
    // Reload profile data
    await loadUserProfile()
    
    setTimeout(() => {
      editSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    editErrorMessage.value = error.response?.data?.message || 'Failed to update profile'
  } finally {
    isEditLoading.value = false
  }
}

const changePassword = async () => {
  if (!isPasswordFormValid.value) return

  isPasswordLoading.value = true
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''

  try {
    await api.post('/auth/change-password', passwordForm.value)
    passwordSuccessMessage.value = 'Password changed successfully!'
    
    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    setTimeout(() => {
      passwordSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    passwordErrorMessage.value = error.response?.data?.message || 'Failed to change password'
  } finally {
    isPasswordLoading.value = false
  }
}

const handleMenuToggle = (isOpen) => {
  isMenuOpen.value = isOpen
}

const goBack = () => {
  router.go(-1)
}

const navigateToProduct = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/product')
  }, durationWait)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
/* Custom styles similar to ProductPage */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>