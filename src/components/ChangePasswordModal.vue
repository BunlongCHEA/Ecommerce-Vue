<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Change Password</h3>
      </div>

      <!-- Modal Content -->
      <form @submit.prevent="changePassword" class="px-6 py-4">
        <!-- Current Password -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            v-model="formData.currentPassword"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- New Password -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            v-model="formData.newPassword"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minlength="6"
          />
          <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
        </div>

        <!-- Confirm Password -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': passwordMismatch }"
            required
          />
          <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">Passwords do not match</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ successMessage }}
        </div>

        <!-- Modal Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            :disabled="isLoading || passwordMismatch || !isFormValid"
          >
            {{ isLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'

const emit = defineEmits(['close', 'success'])

const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordMismatch = computed(() => {
  return formData.value.newPassword !== formData.value.confirmPassword && 
         formData.value.confirmPassword.length > 0
})

const isFormValid = computed(() => {
  return formData.value.currentPassword.length > 0 &&
         formData.value.newPassword.length >= 6 &&
         formData.value.confirmPassword.length > 0 &&
         !passwordMismatch.value
})

const changePassword = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.post('/userprofile/change-password', formData.value)
    successMessage.value = 'Password changed successfully!'
    
    // Clear form
    formData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // Emit success event and close modal after delay
    setTimeout(() => {
      emit('success')
    }, 1500)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to change password'
  } finally {
    isLoading.value = false
  }
}
</script>