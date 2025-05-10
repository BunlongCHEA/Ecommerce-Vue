<template>
  <div class="app-container">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="['progress-step', { active: currentStep === index }]"
        @click="goToStep(index)"
      >
        {{ step }}
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Step 1: View Locations -->
      <div v-if="currentStep === 0">
        <h2 class="subtitle">Your Locations</h2>
        <div v-if="locations.length > 0" class="location-list">
          <div v-for="(location, index) in locations" :key="index" class="location-box">
            <div class="location-info">
              <p class="location-title">{{ location.Address }}</p>
              <p class="location-detail">Postal Code: {{ location.PostalCode }}</p>
              <p class="location-detail">Region: {{ location.Region }}</p>
              <p class="location-detail">
                Country: {{ location.CountryName }} ({{ location.CountryCode }})
              </p>
            </div>
            <div class="button-group">
              <button @click="editLocation(index)" class="button secondary">Edit</button>
              <button @click="deleteLocation(index)" class="button danger">Delete</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No locations available.</div>
        <div class="action">
          <button @click="goToStep(1)" class="button primary">Add Location</button>
        </div>
      </div>

      <!-- Step 2: Register Location -->
      <div v-if="currentStep === 1">
        <h2 class="subtitle">Register a New Location</h2>
        <form @submit.prevent="saveLocationData" class="location-form">
          <div class="form-group">
            <label for="address">Address</label>
            <input
              type="text"
              id="address"
              v-model="newAddress"
              placeholder="Enter address"
              required
            />
          </div>
          <div class="form-group">
            <label for="postalCode">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              v-model="newPostalCode"
              placeholder="Enter postal code"
              required
            />
          </div>
          <div class="form-group">
            <label for="country">Country</label>
            <select id="country" v-model="newCountry" @change="filterRegionsByCountry" required>
              <option disabled value="">Select a country</option>
              <option v-for="(country, index) in countryOptions" :key="index" :value="country">
                {{ country.CountryName }} ({{ country.CountryCode }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="region">Region</label>
            <select id="region" v-model="newRegion" required>
              <option disabled value="">Select a region</option>
              <option v-for="(region, index) in filteredRegions" :key="index" :value="region">
                {{ region.Region }}
              </option>
            </select>
          </div>
          <button type="submit" class="button primary">Save Location</button>
        </form>
      </div>

      <!-- Step 3: Confirm Location -->
      <div v-if="currentStep === 2">
        <h2 class="subtitle">Confirm Your Location</h2>
        <div class="location-summary">
          <p><strong>Address:</strong> {{ newAddress }}</p>
          <p><strong>Postal Code:</strong> {{ newPostalCode }}</p>
          <p><strong>Region:</strong> {{ newRegion.Region }}</p>
          <p>
            <strong>Country:</strong> {{ newCountry.CountryName }} ({{ newCountry.CountryCode }})
          </p>
        </div>
        <div class="action">
          <button @click="confirmLocation" class="button primary">Finish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// Components
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'

const loading = ref(false)
const popupRef = ref(null)

const steps = ['View Locations', 'Register Location', 'Confirm Location']
const currentStep = ref(0)
const locations = ref([])
const userId = ref(null)
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
const fetchUserId = () => {
  try {
    // First, attempt to retrieve userId from localStorage
    const storedUserId = localStorage.getItem('userId')
    userId.value = storedUserId
    console.log('Logged-in User ID (from localStorage):', userId.value)

    // If not found in localStorage, attempt to retrieve it from cookies
    const cookies = document.cookie.split('; ')
    console.log('Cookies:', cookies)
    const userIdCookie = cookies.find((row) => row.startsWith('userId='))
    userId.value = userIdCookie.split('=')[1]
    console.log('Logged-in User ID (from cookies):', userId.value)
  } catch (error) {
    console.error('Error retrieving User ID:', error)
  }
}

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
    // newAddress.value = ''
    // newPostalCode.value = ''
    // newRegion.value = null
    // newCountry.value = null
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
/* General container styles */
.app-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  /* overflow-y: auto; */
  background-color: #f9f9f9;
}

/* Progress bar styles */
.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.progress-step {
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #e0e0e0;
  cursor: pointer;
}

.progress-step.active {
  background-color: #007bff;
  color: #fff;
}

/* Subtitle styles */
.subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
}

/* List styles */
.location-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.location-box {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.location-detail {
  color: #777;
}

/* Form styles */
.location-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
}

input:focus,
select:focus {
  border-color: #007bff;
  outline: none;
}

/* Buttons */
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.button.primary {
  background-color: #28a745;
  color: #fff;
}

.button.primary:hover {
  background-color: #218838;
}

.button.secondary {
  background-color: #17a2b8;
  color: #fff;
}

.button.secondary:hover {
  background-color: #138496;
}

.button.danger {
  background-color: #dc3545;
  color: #fff;
}

.button.danger:hover {
  background-color: #c82333;
}
</style>
