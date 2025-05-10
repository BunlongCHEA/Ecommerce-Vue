<template>
  <div class="coupon-page">
    <div class="search-coupon">
      <input
        v-model="searchCoupon"
        type="text"
        placeholder="Enter coupon code"
        class="search-input"
      />
      <button @click="searchForCoupon" class="search-button">Search</button>
    </div>
    <!-- <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div> -->
    <div class="coupon-list">
      <div v-for="coupon in coupons" :key="coupon.Id" class="coupon-card">
        <p><strong>Code:</strong> {{ coupon.CouponCode }}</p>
        <p><strong>Discount:</strong> ${{ coupon.CouponDiscountAmount }}</p>
        <p><strong>Description:</strong> {{ coupon.CouponDescription }}</p>
        <p><strong>Expiry Date:</strong> {{ formatDate(coupon.ExpiryDate) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api.js'

const searchCoupon = ref('')
// const errorMessage = ref('')
const coupons = ref([])
const userId = ref(null)

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
const fetchUserId = () => {
  try {
    // First, attempt to retrieve userId from localStorage
    const storedUserId = localStorage.getItem('userId')

    if (storedUserId) {
      userId.value = storedUserId
      console.log('Logged-in User ID (from localStorage):', userId.value)
    } else {
      // If not found in localStorage, attempt to retrieve it from cookies
      const cookies = document.cookie.split('; ')
      console.log('Cookies:', cookies)
      const userIdCookie = cookies.find((row) => row.startsWith('userId='))
      userId.value = userIdCookie.split('=')[1]
      console.log('Logged-in User ID (from cookies):', userId.value)
    }
  } catch (error) {
    console.error('Error retrieving User ID:', error)
  }
}

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
        alert('You have already added this coupon!')
        return
      }

      // Add coupon to couponuserlist
      await addCouponToUserList(validCoupon)

      // Refresh coupons after adding
      await fetchCoupons()
      alert(`Coupon "${response.data.code}" is valid!`)
    } else {
      console.log('Invalid or expired coupon.')
    }
  } catch (error) {
    console.error('Error searching for coupon:', error)
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
    alert('Failed to add the coupon. Please try again.')
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
.coupon-page {
  padding: 1rem;
}

.search-coupon {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
}

.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.coupon-card {
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>
