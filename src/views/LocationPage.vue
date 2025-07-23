<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-white text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />
    <ConfirmDelete
      v-model:show="showDeleteConfirm"
      :title="'Delete Location'"
      :message="'Are you sure you want to delete this location? This action cannot be undone.'"
      :loading="deleteLoading"
      @confirm="confirmDeleteLocation"
      @cancel="cancelDeleteLocation"
    />

    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">
      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Cart'"
        :destination="'/cart'"
        :defaultTitle="'Manage Location'"
        :waitDuration="durationWait"
      ></BackButton>
      
      <!-- Progress Bar -->
      <div class="w-full bg-white py-6 flex justify-center">
        <div class="w-full max-w-4xl bg-gray-50 border rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="relative flex items-center flex-1"
            >
              <!-- Step Circle -->
              <div
                class="flex flex-col items-center gap-2 cursor-pointer"
                @click="goToStep(index)"
              >
                <div
                  class="w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300"
                  :class="{
                    'bg-indigo-600 text-white border-indigo-600': currentStep >= index,
                    'bg-white text-indigo-600 border-indigo-600': currentStep < index,
                  }"
                >
                  <!-- Step Number or Checkmark -->
                  <template v-if="currentStep > index">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd" />
                    </svg>
                  </template>
                  <template v-else>
                    {{ index + 1 }}
                  </template>
                </div>
                <!-- Step Label -->
                <span
                  class="text-sm font-medium text-center"
                  :class="{ 'text-indigo-600': currentStep === index, 'text-gray-500': currentStep !== index }"
                >
                  {{ step }}
                </span>
              </div>

              <!-- Connector -->
              <div
                v-if="index < steps.length - 1 || index === steps.length - 1"
                class="flex-grow h-0.5 mx-2"
                :class="{ 'bg-indigo-600': currentStep > index, 'bg-gray-300': currentStep <= index }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="flex-grow flex flex-col items-center bg-white">
        <!-- Step 1: View Locations -->
        <div v-if="currentStep === 0" class="w-full max-w-3xl">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Your Locations</h2>
          <div v-if="locations.length > 0" class="space-y-4">
            <div
              v-for="(location, index) in locations"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-500 hover:from-purple-500 hover:to-purple-600 transition duration-300 text-white"
            >
              <div>
                <p class="font-medium">{{ location.address }}</p>
                <p class="text-sm">Postal Code: {{ location.postalCode }}</p>
                <p class="text-sm">Region: {{ location.region }}</p>
                <p class="text-sm">
                  Country: {{ location.countryName }} ({{ location.countryCode }})
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editLocation(index)"
                  class="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-blue-50 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  @click="promptDeleteLocation(index)"
                  class="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-red-50 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-6">
            No locations available.
          </div>
          <div class="mt-6">
            <button
              @click="goToStep(1)"
              class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Add Location
            </button>
          </div>
        </div>

        <!-- Step 2: Register Location -->
        <div v-if="currentStep === 1" class="w-full max-w-3xl">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Register a New Location</h2>
          <form @submit.prevent="saveLocationData" class="space-y-4">
            <div>
              <label for="address" class="block text-sm font-medium">Address</label>
              <input
                type="text"
                id="address"
                v-model="newAddress"
                class="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                required
              />
            </div>
            <div>
              <label for="postalCode" class="block text-sm font-medium">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                v-model="newPostalCode"
                class="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                required
              />
            </div>
            <div>
              <label for="country" class="block text-sm font-medium">Country</label>
              <select
                id="country"
                v-model="newCountry"
                @change="filterRegionsByCountry"
                class="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                required
              >
                <option disabled value="">Select a country</option>
                <option
                  v-for="(country, index) in countryOptions"
                  :key="index"
                  :value="country"
                >
                  {{ country.countryName }} ({{ country.countryCode }})
                </option>
              </select>
            </div>
            <div>
              <label for="region" class="block text-sm font-medium">Region</label>
              <select
                id="region"
                v-model="newRegion"
                class="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                required
              >
                <option disabled value="">Select a region</option>
                <option
                  v-for="(region, index) in filteredRegions"
                  :key="index"
                  :value="region"
                >
                  {{ region.region }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Save Location
            </button>
          </form>
          <button
            @click="goToStep(0)"
            class="mt-4 w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>

        <!-- Step 3: Confirm Location -->
        <div v-if="currentStep === 2" class="w-full max-w-3xl">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Confirm Your Location</h2>
          <div class="p-4 border border-gray-200 rounded-lg shadow-sm space-y-2 bg-white/80 backdrop-blur-md">
            <p><strong>Address:</strong> {{ newAddress }}</p>
            <p><strong>Postal Code:</strong> {{ newPostalCode }}</p>
            <p><strong>Region:</strong> {{ newRegion.region }}</p>
            <p>
              <strong>Country:</strong> {{ newCountry.countryName }} ({{ newCountry.countryCode }})
            </p>
          </div>
          <div class="mt-6">
            <button
              @click="confirmLocation"
              class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Finish
            </button>
          </div>
          <button
            @click="goToStep(1)"
            class="mt-4 w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import api from '@/services/api'

import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'
import BackButton from '@/components/BackButton.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import ConfirmDelete from '@/components/ConfirmDelete.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
// Update menu state
const isMenuOpen = ref(false);
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState;
}

// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

const durationWait = 1000 // 1 second
const loading = ref(false)
const popupRef = ref(null)

// Delete confirmation state
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const locationToDeleteIndex = ref(null)

const steps = ['View Locations', 'Register Location', 'Confirm Location']
const currentStep = ref(0)
const locations = ref([])
const regionOptions = ref([])
const filteredRegions = ref([]) // Filtered regions based on the selected country
const countryOptions = ref([])
const editingIndex = ref(null) // Track the index of the location being edited

// Fields for creating a new location
const newAddress = ref('')
const newPostalCode = ref('')
const newRegion = ref(null)
const newCountry = ref(null)

// Fetch locations and countries
const fetchLocations = async () => {
  loading.value = true
  try {
    const response = await api.get('/location')
    locations.value = response.data.map((loc) => ({
      postalCode: loc.postalCode,
      address: loc.address,
      region: loc.region,
      countryId: loc.countryId,
      countryName: loc.countryName,
      countryCode: loc.countryCode,
      id: loc.id,
    }))
  } catch (error) {
    popupRef.value.show('Error fetching locations.', 'error')
    console.error('Error fetching locations:', error)
  } finally {
    loading.value = false
  }
}

const fetchRegions = async () => {
  try {
    const response = await api.get('/locationRegion')
    regionOptions.value = response.data.map((region) => ({
      region: region.region,
      regionId: region.id,
      countryId: region.countryId,
    }))

    // Initially set the filteredRegions to include all regions
    filteredRegions.value = [...regionOptions.value]
  } catch (error) {
    popupRef.value.show('Error fetching regions.', 'error')
    console.error('Error fetching regions:', error)
  }
}

const fetchCountries = async () => {
  try {
    const response = await api.get('/locationCountry')
    countryOptions.value = response.data.map((country) => ({
      countryName: country.countryName,
      countryCode: country.countryCode,
      countryId: country.id,
    }))
  } catch (error) {
    popupRef.value.show('Error fetching countries.', 'error')
    console.error('Error fetching countries:', error)
  }
}

// Filter regions by the selected country
const filterRegionsByCountry = () => {
  if (newCountry.value) {
    const countryId = newCountry.value.countryId
    // Reset filteredRegions to the original regionOptions before filtering
    filteredRegions.value = regionOptions.value.filter((region) => region.countryId === countryId)
  }
  return regionOptions.value
}

// Save location data and move to step 3
const saveLocationData = () => {
  if (!newAddress.value || !newPostalCode.value || !newRegion || !newCountry) {
    popupRef.value.show('Please fill in all the required fields.', 'error')
    return
  }

  // Validation for editing
  if (editingIndex.value !== null) {
    // Update existing location
    goToStep(2) // Navigate to confirm location before editing
  } else {
    // Add new location
    goToStep(2) // Move to step 3 for confirmation
  }
}

// Confirm location
const confirmLocation = async () => {
  loading.value = true
  try {
    if (editingIndex.value !== null) {
      // Update existing location
      await updateLocation()
    } else {
      // Register new location
      await registerLocation()
    }
    popupRef.value.show('Location saved successfully!', 'success')
  } catch (error) {
    popupRef.value.show('Error saving location.', 'error')
  } finally {
    loading.value = false
  }
}

// Register location
const registerLocation = async () => {
  try {
    const response = await api.post('/location', {
      postalCode: newPostalCode.value,
      address: newAddress.value,
      regionId: newRegion.value.regionId,
      userId: userId.value,
    })

    // Refresh the list of locations
    await fetchLocations()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    console.error('Error registering location:', error)
    throw error
  }
}

// Update existing location
const updateLocation = async () => {
  const locationId = locations.value[editingIndex.value].id

  try {
    const response = await api.put(`/location/${locationId}`, {
      id: locationId,
      postalCode: newPostalCode.value,
      address: newAddress.value,
      regionId: newRegion.value.regionId,
      countryId: newCountry.value.countryId,
      userId: userId.value,
    })

    // Refresh the list of locations
    await fetchLocations()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

// Edit location
const editLocation = (index) => {
  const location = locations.value[index]

  editingIndex.value = index // Set the index for editing
  newAddress.value = location.address
  newPostalCode.value = location.postalCode
  newCountry.value = countryOptions.value.find(
    (country) => country.countryName === location.countryName,
  )
  filterRegionsByCountry()
  newRegion.value = regionOptions.value.find((region) => region.region === location.region)
  goToStep(1)
}

// Prompt for deletion
const promptDeleteLocation = (index) => {
  locationToDeleteIndex.value = index
  showDeleteConfirm.value = true
}

// Confirm delete location
const confirmDeleteLocation = async () => {
  if (locationToDeleteIndex.value === null) return
  
  deleteLoading.value = true
  try {
    const locationId = locations.value[locationToDeleteIndex.value].id
    await api.delete(`/location/${locationId}`)
    locations.value.splice(locationToDeleteIndex.value, 1)
    popupRef.value.show('Location deleted successfully.', 'success')
  } catch (error) {
    console.error('Error deleting location:', error)
    popupRef.value.show('Error deleting location.', 'error')
  } finally {
    deleteLoading.value = false
    showDeleteConfirm.value = false
    locationToDeleteIndex.value = null
  }
}

// Cancel delete location
const cancelDeleteLocation = () => {
  locationToDeleteIndex.value = null
}

// Reset the form
const resetForm = () => {
  newAddress.value = ''
  newPostalCode.value = ''
  newRegion.value = null
  newCountry.value = null
  editingIndex.value = null // Reset editing index
}

// Navigate between steps
const goToStep = (step) => {
  // Step 3 Validation: Ensure data exists from Step 2 before proceeding
  if (step === 2 && (!newAddress.value || !newPostalCode.value || !newRegion || !newCountry)) {
    popupRef.value.show('Please fill in all the required fields before proceeding.', 'error')
    return
  }
  currentStep.value = step
}

// Fetch data on page load
onMounted(async () => {
  await fetchUserId()
  await fetchLocations()
  await fetchRegions()
  await fetchCountries()
})
</script>