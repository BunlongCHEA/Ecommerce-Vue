<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-white text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Back Button -->
    <!-- <div class="flex justify-between items-center px-4 py-4 bg-transparent text-white shadow backdrop-blur-md">
      <button
        @click="$router.push('/cart')"
        class="flex items-center gap-2 font-medium text-black hover:bg-gradient-to-r from-gray-300/50 to-gray-500/50 px-4 py-2 rounded-md transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0L2.293 10l6-6a1 1 0 011.414 1.414L4.414 10l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Cart
      </button>
      <h1 class="text-2xl font-bold text-black">Manage Location</h1>
      <div class="w-24"></div>
    </div> -->

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
              <p class="font-medium">{{ location.Address }}</p>
              <p class="text-sm">Postal Code: {{ location.PostalCode }}</p>
              <p class="text-sm">Region: {{ location.Region }}</p>
              <p class="text-sm">
                Country: {{ location.CountryName }} ({{ location.CountryCode }})
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
                @click="deleteLocation(index)"
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
                {{ country.CountryName }} ({{ country.CountryCode }})
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
                {{ region.Region }}
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
          <p><strong>Region:</strong> {{ newRegion.Region }}</p>
          <p>
            <strong>Country:</strong> {{ newCountry.CountryName }} ({{ newCountry.CountryCode }})
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'
import BackButton from '@/components/BackButton.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

const durationWait = 1000 // 1 second
const loading = ref(false)
const popupRef = ref(null)

const steps = ['View Locations', 'Register Location', 'Confirm Location']
const currentStep = ref(0)
const locations = ref([])
// const userId = ref(null)
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
  try {
    const response = await api.get('/location')

    console.log('Locations:', response.data)

    locations.value = response.data.map((loc) => ({
      PostalCode: loc.postalCode,
      Address: loc.address,
      Region: loc.region,
      CountryId: loc.countryId,
      CountryName: loc.countryName,
      CountryCode: loc.countryCode,
      Id: loc.id,
    }))
  } catch (error) {
    console.error('Error fetching locations:', error)
  }
}

const fetchRegions = async () => {
  try {
    const response = await api.get('/locationRegion')

    console.log('Regions:', response.data)

    regionOptions.value = response.data.map((region) => ({
      Region: region.region,
      RegionId: region.id,
      CountryId: region.countryId,
    }))

    // Initially set the filteredRegions to include all regions
    filteredRegions.value = [...regionOptions.value]
  } catch (error) {
    console.error('Error fetching regions:', error)
  }
}

const fetchCountries = async () => {
  try {
    const response = await api.get('/locationCountry')

    console.log('Countries:', response.data)

    countryOptions.value = response.data.map((country) => ({
      CountryName: country.countryName,
      CountryCode: country.countryCode,
      CountryId: country.id,
    }))
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
}

// Fetch the logged-in user's ID from localStorage or cookies
// const fetchUserId = () => {
//   try {
//     // First, attempt to retrieve userId from localStorage
//     const storedUserId = localStorage.getItem('userId')
//     userId.value = storedUserId
//     console.log('Logged-in User ID (from localStorage):', userId.value)

//     // If not found in localStorage, attempt to retrieve it from cookies
//     const cookies = document.cookie.split('; ')
//     console.log('Cookies:', cookies)
//     const userIdCookie = cookies.find((row) => row.startsWith('userId='))
//     userId.value = userIdCookie.split('=')[1]
//     console.log('Logged-in User ID (from cookies):', userId.value)
//   } catch (error) {
//     console.error('Error retrieving User ID:', error)
//   }
// }

// Filter regions by the selected country
const filterRegionsByCountry = () => {
  if (newCountry.value) {
    const countryId = newCountry.value.CountryId
    console.log('Filtering regions for Country ID:', countryId)

    // Reset filteredRegions to the original regionOptions before filtering
    filteredRegions.value = regionOptions.value.filter((region) => region.CountryId === countryId)
    console.log('RegionOptions Regions:', regionOptions.value)
    console.log('Filtered Regions:', filteredRegions.value)
  }
  return regionOptions.value
}

// Save location data and move to step 3
const saveLocationData = () => {
  console.log('Saving location data:', newAddress.value, newPostalCode.value, newRegion, newCountry)
  if (!newAddress.value || !newPostalCode.value || !newRegion || !newCountry) {
    popupRef.value.show('Please fill in all the required fields.', 'error')
    return
  }

  // Validation for editing
  if (editingIndex.value !== null) {
    // Update existing location
    // updateLocation()
    goToStep(2) // Navigate to confirm location before editing
  } else {
    // Add new location
    goToStep(2) // Move to step 3 for confirmation
  }
}

// Confirm location
const confirmLocation = async () => {
  if (editingIndex.value !== null) {
    // Update existing location
    await updateLocation()
  } else {
    // Register new location
    await registerLocation()
  }
}

// Register location
const registerLocation = async () => {
  console.log(
    'Registering location Address:',
    newAddress.value,
    ', PostalCode:',
    newPostalCode.value,
    ', RegionId:',
    newRegion.value.RegionId,
    ', CountryId:',
    newCountry.value.CountryId,
    ', UserId:',
    userId.value,
  )

  try {
    const response = await api.post('/location', {
      postalCode: newPostalCode.value,
      address: newAddress.value,
      regionId: newRegion.value.RegionId,
      // countryId: newCountry.value.CountryId,
      userId: userId.value,
    })
    console.log('Location registered successfully:', response.data)

    // Refresh the list of locations
    await fetchLocations()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    console.error('Error registering location:', error)
  }
}

// Update existing location
const updateLocation = async () => {
  const locationId = locations.value[editingIndex.value].Id

  console.log(
    'Updating location:',
    locationId,
    newAddress.value,
    newPostalCode.value,
    newRegion,
    newCountry,
  )

  try {
    const response = await api.put(`/location/${locationId}`, {
      id: locationId,
      postalCode: newPostalCode.value,
      address: newAddress.value,
      regionId: newRegion.value.RegionId,
      countryId: newCountry.value.CountryId,
      userId: userId.value,
    })
    console.log('Location updated successfully:', response.data)

    // Refresh the list of locations
    await fetchLocations()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    console.error('Error updating location:', error)
  }
}
// Edit location
const editLocation = (index) => {
  const location = locations.value[index]
  console.log('Editing location with Index:', location)

  editingIndex.value = index // Set the index for editing
  newAddress.value = location.Address
  newPostalCode.value = location.PostalCode
  newCountry.value = countryOptions.value.find(
    (country) => country.CountryName === location.CountryName,
  )
  filterRegionsByCountry()
  newRegion.value = regionOptions.value.find((region) => region.Region === location.Region)
  goToStep(1)
}

// Delete location
const deleteLocation = async (index) => {
  try {
    const locationId = locations.value[index].Id
    await api.delete(`/location/${locationId}`)
    locations.value.splice(index, 1)
  } catch (error) {
    console.error('Error deleting location:', error)
  }
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

<style scoped>

</style>
