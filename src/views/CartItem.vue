<template>
  <div class="flex flex-col w-full min-h-screen bg-gray-50 px-4 md:px-6 py-6">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- <div class="flex justify-between items-center px-4 py-4 bg-transparent text-white shadow backdrop-blur-md">
      <button
        @click="goBack"
        class="flex items-center gap-2 font-medium text-black hover:bg-gradient-to-r from-gray-300/50 to-gray-500/50 px-4 py-2 rounded-md transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0L2.293 10l6-6a1 1 0 011.414 1.414L4.414 10l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Products
      </button>
      <h1 class="text-2xl font-bold text-black">Shopping Cart</h1>
      <div class="w-24"></div>
    </div> -->

    <!-- Back Button & Title Component -->
    <BackButton
      :buttonLabel="'Back to Products'"
      :destination="'/product'"
      :defaultTitle="'Shopping Cart'"
      :waitDuration="durationWait"
    ></BackButton>

    <!-- Main Container with Left and Right Columns -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Column: Cart Details -->
      <div class="flex-grow lg:w-2/3">
        <!-- Selection Sections: Location, Payment, Coupon -->
        <div class="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <!-- Selection Tabs -->
          <div class="flex border-b">
            <button 
              class="px-6 py-3 font-medium text-sm transition-colors"
              :class="activeTab === 'delivery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'"
              @click="activeTab = 'delivery'"
            >
              Delivery Location
            </button>
            <button 
              class="px-6 py-3 font-medium text-sm transition-colors"
              :class="activeTab === 'payment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'"
              @click="activeTab = 'payment'"
            >
              Payment Method
            </button>
            <button 
              class="px-6 py-3 font-medium text-sm transition-colors"
              :class="activeTab === 'coupon' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'"
              @click="activeTab = 'coupon'"
            >
              Coupons
            </button>
          </div>

          <!-- Delivery Locations (Tab Content) -->
          <div v-if="activeTab === 'delivery'" class="p-4">
            <div v-if="locations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(loc, i) in locations"
                :key="i"
                @click="toggleLocationSelection(i)"
                class="border rounded-lg p-4 cursor-pointer transition-all"
                :class="selectedLocation === i ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'"
              >
                <div class="flex items-start gap-3">
                  <div class="mt-1">
                    <div :class="selectedLocation === i ? 'bg-blue-500' : 'bg-gray-200'" class="w-4 h-4 rounded-full flex items-center justify-center">
                      <div v-if="selectedLocation === i" class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ loc.Address }}</p>
                    <p class="text-sm text-gray-600 mt-1">Postal Code: {{ loc.PostalCode }}</p>
                    <p class="text-sm text-gray-600">Region: {{ loc.Region }}</p>
                    <p class="text-sm text-gray-600">{{ loc.CountryName }} ({{ loc.CountryCode }})</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-500">No locations available</div>
            <div class="mt-4">
              <button @click="addLocation" class="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                Manage Delivery Locations
              </button>
            </div>
          </div>

          <!-- Payment Methods (Tab Content) -->
          <div v-if="activeTab === 'payment'" class="p-4">
            <div v-if="payments.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(payment, index) in payments"
                :key="index"
                @click="togglePaymentSelection(index)"
                class="border rounded-lg p-4 cursor-pointer transition-all"
                :class="selectedPayment === index ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'"
              >
                <div class="flex items-start gap-3">
                  <div class="mt-1">
                    <div :class="selectedPayment === index ? 'bg-blue-500' : 'bg-gray-200'" class="w-4 h-4 rounded-full flex items-center justify-center">
                      <div v-if="selectedPayment === index" class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ payment.PaymentMethod }}</p>
                    <p class="text-sm text-gray-600 mt-1">Card/Account: {{ payment.AccountOrCardNumber }}</p>
                    <p class="text-sm text-gray-600">Expiry: {{ formatDate(payment.CardExpireDate) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-500">No payment methods available</div>
            <div class="mt-4">
              <button @click="addPaymentMethod" class="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                Add Payment Method
              </button>
            </div>
          </div>

          <!-- Coupons (Tab Content) -->
          <div v-if="activeTab === 'coupon'" class="p-4">
            <div v-if="coupons.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(coupon, index) in coupons"
                :key="index"
                @click="toggleCouponSelection(index)"
                class="border rounded-lg p-4 cursor-pointer transition-all"
                :class="selectedCoupon === index ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'"
              >
                <div class="flex items-start gap-3">
                  <div class="mt-1">
                    <div :class="selectedCoupon === index ? 'bg-blue-500' : 'bg-gray-200'" class="w-4 h-4 rounded-full flex items-center justify-center">
                      <div v-if="selectedCoupon === index" class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ coupon.CouponCode }} <span class="text-red-600 font-semibold">-{{ coupon.CouponDiscountAmount }}%</span></p>
                    <p class="text-sm text-gray-600 mt-1">{{ coupon.CouponDescription }}</p>
                    <p class="text-sm text-gray-600">Expires: {{ formatDate(coupon.ExpiryDate) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-500">No coupons available</div>
            <div class="mt-4">
              <!-- <router-link to="/coupon" class="">
                View More Coupons
              </router-link> -->

              <button @click="addCoupon" class="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                View More Coupons
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Items Section -->
        <div class="bg-white rounded-lg shadow-sm">
          <h2 class="px-6 py-4 border-b font-semibold text-lg text-gray-800">Cart Items</h2>
          
          <div v-if="userCartItems.length === 0" class="p-6 text-center text-gray-500">
            Your cart is empty
          </div>
          
          <div v-else>
            <!-- Cart Items List -->
            <div class="divide-y">
              <div v-for="(item, index) in userCartItems" :key="index" class="flex p-4 hover:bg-gray-50">
                <!-- Product Image -->
                <div class="w-24 h-24 flex-shrink-0">
                  <img :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover rounded-md" />
                </div>
                
                <!-- Product Details -->
                <div class="ml-4 flex-grow">
                  <div class="flex justify-between">
                    <h3 class="font-medium text-gray-800">{{ item.name }}</h3>
                    <button @click="removeItem(index)" class="text-gray-400 hover:text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div class="mt-1 text-sm text-gray-500">
                    <span>Store: {{ item.storeName }}</span>
                    <span v-if="item.discountAmount" class="text-red-500 ml-2">(-{{ item.discountAmount }}%)</span>
                  </div>
                  
                  <div class="mt-2 flex justify-between items-center">
                    <div class="flex items-center">
                      <button 
                        @click="decreaseQuantity(index)" 
                        class="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >-</button>
                      <span class="w-10 text-center">{{ item.quantity }}</span>
                      <button 
                        @click="increaseQuantity(index)" 
                        class="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >+</button>
                    </div>
                    
                    <div class="text-right">
                      <div class="text-sm text-gray-500">${{ item.price.toFixed(2) }} each</div>
                      <div class="font-semibold text-gray-800">${{ (item.price * item.quantity).toFixed(2) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Clear Cart Button -->
            <div class="p-4 border-t">
              <button 
                @click="clearCart" 
                class="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Clear All Items
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="lg:w-1/3">
        <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
          <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium text-green-600">${{ totalAmount.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping Fee</span>
              <span class="font-medium text-red-600">-${{ totalShippingCost.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between" v-if="selectedCoupon !== null">
              <span class="text-gray-600">Discount ({{ coupons[selectedCoupon]?.CouponDiscountAmount }}%)</span>
              <span class="font-medium text-red-600">-${{ calCouponDiscount.toFixed(2) }}</span>
            </div>
            
            <div class="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>${{ totalAmountAfterDiscountAndShipping }}</span>
            </div>
          </div>
          
          <button 
            @click="proceedToOrder" 
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Proceed to Checkout
          </button>
          
          <div class="mt-4 text-xs text-gray-500 text-center">
            <p>Total Items: {{ totalItems }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import BackButton from '@/components/BackButton.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

const router = useRouter()
const cart = ref([])
const locations = ref([])
const payments = ref([])
const coupons = ref([])
const shippingCost = ref(10)
const couponDiscountAmount = ref(0)
// const userId = ref(null) // Track logged-in user ID

// Selected location and payment
const selectedLocation = ref(null) // Track selected location index
const selectedPayment = ref(null) // Track selected payment index
const selectedCoupon = ref(null) // Track selected coupon index

// Tab management
const activeTab = ref('delivery') // Default active tab

// Loading and popup references
const durationWait = 1000 // 1 second
const loading = ref(false)
const popupRef = ref(null)

// Methods
// Fetch locations, payment, couponuserlist
const fetchLocations = async () => {
  try {
    const response = await api.get('/location')
    console.log('Locations:', response.data)

    locations.value = response.data.map((loc) => ({
      Address: loc.address,
      PostalCode: loc.postalCode,
      Region: loc.region,
      CountryName: loc.countryName,
      CountryCode: loc.countryCode,
      Id: loc.id,
      UserId: loc.userId,
    }))

    console.log('Formatted Locations:', locations.value)
  } catch (error) {
    console.error('Error fetching locations:', error)
  }
}

// Fetch payment methods from local storage
const fetchPayments = async () => {
  try {
    const response = await api.get('/payment')
    console.log('Payments:', response.data)

    payments.value = response.data.map((payment) => ({
      Id: payment.id,
      UserId: payment.userId,
      PaymentMethod: payment.paymentMethod,
      BankName: payment.bankName,
      AccountOrCardNumber: payment.accountOrCardNumber,
      CardExpireDate: payment.cardExpireDate,
    }))
    console.log('Formatted Payments:', payments.value)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
  }
}

// Fetch user coupons
const fetchCoupons = async () => {
  try {
    const response = await api.get('/couponuserlist')
    console.log('Coupons:', response.data)

    coupons.value = response.data
      .filter((coupon) => coupon.couponIsActive && !coupon.isUsed)
      .map((coupon) => ({
        Id: coupon.id,
        CouponId: coupon.couponId,
        UserId: coupon.userId,
        CouponCode: coupon.couponCode,
        CouponDiscountAmount: coupon.couponDiscountAmount,
        CouponDescription: coupon.couponDescription,
        ExpiryDate: coupon.expiryDate,
        IsUsed: coupon.isUsed,
      }))
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

// Toggle location selection
const toggleLocationSelection = (index) => {
  selectedLocation.value = selectedLocation.value === index ? null : index
  console.log(
    'Selected Location:',
    locations.value[index],
    'Selected Location Index:',
    selectedLocation.value,
  )
}

// Toggle payment selection
const togglePaymentSelection = (index) => {
  selectedPayment.value = selectedPayment.value === index ? null : index
  console.log(
    'Selected Payment:',
    payments.value[index],
    'Selected Payment Index:',
    selectedPayment.value,
  )
}

// Toggle coupon selection
const toggleCouponSelection = (index) => {
  selectedCoupon.value = selectedCoupon.value === index ? null : index
  couponDiscountAmount.value =
    selectedCoupon.value !== null ? coupons.value[selectedCoupon.value].CouponDiscountAmount : 0

  console.log(
    'Selected Coupon:',
    coupons.value[index],
    'Selected Coupon Index:',
    selectedCoupon.value,
  )
  console.log('Coupon Discount Amount:', couponDiscountAmount.value)
}

// Format date to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0] // Split on 'T' and return only the date part
}

const totalItems = computed(() => cart.value
  .filter((item) => item.userId === userId.value)
  .reduce((sum, item) => sum + item.quantity, 0))

const totalAmount = computed(() => cart.value
  .filter((item) => item.userId === userId.value)
  .reduce((sum, item) => sum + item.quantity * item.price, 0),
)

const totalShippingCost = computed(() => {
  if (userCartItems.value.length === 0) {
    return 0
  }
  return shippingCost.value
})

console.log('Total Amount:', totalAmount.value)
console.log('Total Items:', totalItems.value)
const totalAmountAfterDiscountAndShipping = computed(() => {
  const discount = couponDiscountAmount.value / 100
  return (totalAmount.value - (discount * totalAmount.value) - totalShippingCost.value).toFixed(2)
})
const calCouponDiscount = computed(() => {
  return (couponDiscountAmount.value / 100) * totalAmount.value
})

const proceedToOrder = async () => {
  if (cart.value.length === 0) {
    console.log('Your cart is empty!')
    popupRef.value.show('Your cart is empty!', 'error')
    return
  }

  if (selectedLocation.value === null) {
    console.log('Please select a delivery location before proceeding.')
    popupRef.value.show('Please select a delivery location before proceeding.', 'error')
    return
  }

  if (selectedPayment.value === null) {
    console.log('Please select a payment method before proceeding.')
    popupRef.value.show('Please select a payment method before proceeding.', 'error')
    return
  }

  // if (selectedCoupon.value === null) {
  //   console.log('Please select a coupon before proceeding.')
  //   popupRef.value.show('Please select a coupon before proceeding.', 'error')
  //   return
  // }

  try {
    const selectedCouponId =
      selectedCoupon.value !== null ? coupons.value[selectedCoupon.value].Id : null
    const totalFinalAmount =
      totalAmount.value - ((couponDiscountAmount.value / 100) * totalAmount.value) - totalShippingCost.value
    console.log('Selected Coupon ID:', selectedCouponId)
    console.log('Total Final Amount:', totalFinalAmount)

    // Step 1: Create shipment
    console.log('locationId:', locations.value[selectedLocation.value].Id)
    const shipmentResponse = await api.post('/shipment', {
      trackingNumber: `TRK-${Date.now()}`,
      // shipmentDate: new Date().toISOString(),
      shippingCost: totalShippingCost.value,
      shipmentTypeId: 1,
      locationId: locations.value[selectedLocation.value].Id,
    })
    const shipmentId = shipmentResponse.data.id
    console.log('Shipment created:', shipmentResponse.data)
    console.log('Shipment ID:', shipmentId)

    // Step 2: Update coupon status and usage
    if (selectedCouponId) {
      await api.put(`/couponuserlist/${selectedCouponId}`, {
        Id: selectedCouponId,
        CouponId: coupons.value[selectedCoupon.value].CouponId,
        UserId: userId.value,
        IsUsed: true,
        UsedDate: new Date().toISOString(),
        ExpiryDate: coupons.value[selectedCoupon.value].ExpiryDate,
      })
    }

    // Step 3: Create order
    const orderResponse = await api.post('/order', {
      orderNumber: `ORD-${Date.now()}`,
      orderDate: new Date().toISOString(),
      status: 'Pending',
      totalQuantity: totalItems.value,
      totalAmount: totalAmount.value,
      totalFinalAmount: totalFinalAmount.toFixed(2),
      couponUserListId: selectedCouponId,
      shipmentId: shipmentId,
      paymentId: payments.value[selectedPayment.value].Id,
    })
    const orderId = orderResponse.data.id
    console.log('Order created:', orderResponse.data)
    console.log('Order ID:', orderId)

    // Step 4: Create order items
    console.log('Cart items:', cart.value)
    for (const item of cart.value) {
      await api.post('/orderitem', {
        orderId: orderId,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      })
      console.log('Order item created:', item)
    }

    console.log('Order items created successfully!')
    // popupRef.value.show('Order placed successfully!', 'success')
    cart.value = []
    localStorage.removeItem('cart')
    router.push('/order')

    // Refresh the coupons
    // fetchCoupons()
  } catch (error) {
    console.error('An error occurred while placing the order. Please try again:', error)
    popupRef.value.show('An error occurred while placing the order. Please try again.', 'error')
  }
}

// Redirect to add payment route
const addPaymentMethod = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/payment')
  }, durationWait)
}

// Redirect to add location route
const addLocation = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/location')
  }, durationWait)
}

// Redirect to add coupon route
const addCoupon = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/coupon')
  }, durationWait)
}

const goBack = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/product')
  }, durationWait)
}

// CART MANAGEMENT
// Computed property to filter cart items based on userId
const userCartItems = computed(() => {
  // Only return cart items that belong to the logged-in user
  return cart.value.filter((item) => item.userId === userId.value)
})


const increaseQuantity = (index) => {
  userCartItems.value[index].quantity++
  saveCart()
}

const decreaseQuantity = (index) => {
  if (userCartItems.value[index].quantity > 1) {
    userCartItems.value[index].quantity--
  } else {
    userCartItems.value.splice(index, 1)
  }
  saveCart()
}

const removeItem = (index) => {
  userCartItems.value.splice(index, 1)
  saveCart()
}

// Method to clear the cart
const clearCart = () => {
  // cart.value = []
  // localStorage.removeItem('cart')
  cart.value = cart.value.filter((item) => item.userId !== userId.value)
  saveCart()
}

// Method to save the cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

onMounted(() => {
  cart.value = JSON.parse(localStorage.getItem('cart')) || []
  fetchLocations()
  fetchPayments()
  fetchCoupons()
  fetchUserId()
})
</script>

<style scoped>

</style>
