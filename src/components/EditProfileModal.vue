<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Edit Profile</h3>
      </div>

      <!-- Modal Content -->
      <form @submit.prevent="updateProfile" class="px-6 py-4">
        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <!-- Phone Number -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            v-model="formData.phoneNumber"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Updating...' : 'Update Profile' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update'])

const formData = ref({
  email: '',
  phoneNumber: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  // Initialize form with current user data
  formData.value.email = props.userProfile.email || ''
  formData.value.phoneNumber = props.userProfile.phoneNumber || ''
})

const updateProfile = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await api.put('/userprofile', formData.value)
    successMessage.value = 'Profile updated successfully!'
    
    // Emit update event to parent
    setTimeout(() => {
      emit('update', formData.value)
    }, 1500)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to update profile'
  } finally {
    isLoading.value = false
  }
}
</script>