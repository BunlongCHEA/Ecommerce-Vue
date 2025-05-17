<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Header Section -->
    <!-- <div class="flex justify-between items-center w-full px-6 py-4 bg-white shadow backdrop-blur-md mb-6 fixed top-0 left-0 right-0 z-10">
      <button
        @click="$router.push('/cart')"
        class="flex items-center gap-2 font-medium text-black hover:bg-gradient-to-r from-gray-300/50 to-gray-500/50 px-4 py-2 rounded-md transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0L2.293 10l6-6a1 1 0 011.414 1.414L4.414 10l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Cart
      </button>
      <h1 class="text-2xl font-bold text-black">Manage Coupon</h1>
      <div class="w-24"></div>
    </div> -->

    <!-- Back Button & Title Component -->
    <BackButton
      :buttonLabel="'Back to Cart'"
      :destination="'/cart'"
      :defaultTitle="'Manage Coupon'"
      :waitDuration="durationWait"
    ></BackButton>

    <!-- Ensure content is pushed below fixed header -->
    <div class="mt-20 w-full flex flex-col items-center">
      <!-- Search Section -->
      <div class="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4 text-center">Search for a Coupon</h2>
        <div class="flex gap-4">
          <input
            v-model="searchCoupon"
            type="text"
            placeholder="Enter coupon code"
            class="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keydown.enter="searchForCoupon"
          />
          <button
            @click="searchForCoupon"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Coupon List Section -->
      <div class="w-full px-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4 text-center">Available Coupons</h2>
        <div
          v-if="coupons.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center"
        >
          <div
            v-for="coupon in coupons"
            :key="coupon.Id"
            class="p-4 bg-blue-500 text-white rounded-lg shadow hover:bg-purple-500 hover:shadow-lg transition-all duration-300"
          >
            <p class="font-medium">
              <strong>Code:</strong> {{ coupon.CouponCode }}
            </p>
            <p class="text-sm">
              <strong>Discount:</strong> %{{ coupon.CouponDiscountAmount }}
            </p>
            <p class="text-sm">
              <strong>Description:</strong> {{ coupon.CouponDescription }}
            </p>
            <p class="text-sm">
              <strong>Expiry Date:</strong> {{ formatDate(coupon.ExpiryDate) }}
            </p>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-6">
          No coupons available.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api.js'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import BackButton from '@/components/BackButton.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

const durationWait = 1000 // Default wait time is 1 second
const popupRef = ref(null)
const loading = ref(false)

const searchCoupon = ref('')
// const errorMessage = ref('')
const coupons = ref([])
// const userId = ref(null)

// Fetch coupons
const fetchCoupons = async () => {
  try {
    const response = await api.get('/couponuserlist')
    console.log('Coupons response:', response.data)

    coupons.value = response.data
      .filter((coupon) => coupon.couponIsActive && !coupon.isUsed)
      .map((coupon) => ({
        Id: coupon.id,
        CouponCode: coupon.couponCode,
        CouponDiscountAmount: coupon.couponDiscountAmount,
        CouponDescription: coupon.couponDescription,
        ExpiryDate: coupon.expiryDate,
        CouponDurationValidity: coupon.couponDurationValidity,
      }))
    console.log('Coupons filter response data:', coupons.value)
  } catch (error) {
    console.error('Error fetching coupons:', error)
  }
}

// Fetch the logged-in user's ID from localStorage or cookies
// const fetchUserId = () => {
//   try {
//     // First, attempt to retrieve userId from localStorage
//     const storedUserId = localStorage.getItem('userId')

//     if (storedUserId) {
//       userId.value = storedUserId
//       console.log('Logged-in User ID (from localStorage):', userId.value)
//     } else {
//       // If not found in localStorage, attempt to retrieve it from cookies
//       const cookies = document.cookie.split('; ')
//       console.log('Cookies:', cookies)
//       const userIdCookie = cookies.find((row) => row.startsWith('userId='))
//       userId.value = userIdCookie.split('=')[1]
//       console.log('Logged-in User ID (from cookies):', userId.value)
//     }
//   } catch (error) {
//     console.error('Error retrieving User ID:', error)
//   }
// }

// Search for a coupon
const searchForCoupon = async () => {
  try {
    const response = await api.get(`/coupon?code=${searchCoupon.value}`)
    console.log('Coupon search response:', response.data)

    if (response.data && response.data.isActive) {
      const validCoupon = response.data
      console.log('Valid coupon:', validCoupon)

      // Check if the user already added this coupon
      const isAlreadyAdded = await checkCouponAlreadyAdded(validCoupon.id)
      if (isAlreadyAdded) {
        popupRef.value.show('You have already added this coupon!', 'error')
        return
      }

      // Add coupon to couponuserlist
      await addCouponToUserList(validCoupon)

      // Refresh coupons after adding
      await fetchCoupons()
      popupRef.value.show(`Coupon "${response.data.code}" is valid!`, 'success')

      // Clear the input field
      searchCoupon.value = ''
    }
  } catch (error) {
    console.error('Error searching for coupon:', error)
    popupRef.value.show('Coupon is Invalid OR Expired!', 'error')
    // Clear the input field
    searchCoupon.value = ''
  }
}

// Check if coupon is already added to couponuserlist for the current user
const checkCouponAlreadyAdded = async (couponId) => {
  try {
    const response = await api.get(`/couponuserlist?couponId=${couponId}&userId=${userId.value}`)
    console.log('Check coupon already added response:', response.data)
    console.log('Coupon ID:', couponId)
    console.log('User ID:', userId.value)

    console.log('Array data:', Array.isArray(response.data))
    // Ensure response.data exists and is an array
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('Coupon already added:', response.data)
      return true
    }
    return false
  } catch (error) {
    console.error('Error checking if coupon is already added:', error)
    return false
  }
}

// Add coupon to couponuserlist
const addCouponToUserList = async (coupon) => {
  try {
    const expiryDate = new Date()
    console.log('Current date:', expiryDate)
    console.log('Coupon duration validity:', coupon.durationValidity)
    expiryDate.setDate(expiryDate.getDate() + coupon.durationValidity)
    console.log('Expiry date:', expiryDate)

    await api.post('/couponuserlist', {
      couponId: coupon.id,
      userId: userId.value,
      isUsed: false,
      usedDate: null,
      expiryDate: expiryDate.toISOString(),
    })
  } catch (error) {
    console.error('Error adding coupon to user list:', error)
    popupRef.value.show('Failed to add the coupon. Please try again.', 'error')
  }
}

// Filtered coupons for display
// const filteredCoupons = computed(() =>
//   coupons.value.filter((coupon) => coupon.couponIsActive && !coupon.isUsed),
// )
const filteredCoupons = computed(() => coupons.value)
// console.log('Filtered coupons:', filteredCoupons.value)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchUserId()
  fetchCoupons()
})
</script>

<style scoped>

</style>
