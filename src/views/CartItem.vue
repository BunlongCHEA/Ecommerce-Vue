<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">
      
      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Cart'"
        :destination="'/cart'"
        :defaultTitle="storeName ? `${storeName} Cart` : 'Store Cart'"
        :waitDuration="durationWait"
      ></BackButton>

      <!-- Main Container with Left and Right Columns -->
      <div class="flex flex-col lg:flex-row gap-6 mt-6 px-4">
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

            <!-- Tab Content - Reusing your original implementation -->
            <!-- Delivery Locations -->
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
                      <p class="font-medium text-gray-800">{{ loc.address }}</p>
                      <p class="text-sm text-gray-600 mt-1">Postal Code: {{ loc.postalCode }}</p>
                      <p class="text-sm text-gray-600">Region: {{ loc.region }}</p>
                      <p class="text-sm text-gray-600">{{ loc.countryName }} ({{ loc.countryCode }})</p>
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

            <!-- Payment Methods -->
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
                      <p class="font-medium text-gray-800">{{ payment.paymentMethod }}</p>
                      <p class="text-sm text-gray-600 mt-1">Card/Account: {{ payment.accountOrCardNumber }}</p>
                      <p class="text-sm text-gray-600">Expiry: {{ formatDate(payment.cardExpireDate) }}</p>
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

            <!-- Coupons -->
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
                      <p class="font-medium text-gray-800">{{ coupon.couponCode }} <span class="text-red-600 font-semibold">-{{ coupon.couponDiscountPercentage }}%</span></p>
                      <p class="text-sm text-gray-600 mt-1">{{ coupon.couponDescription }}</p>
                      <p class="text-sm text-gray-600">Expires: {{ formatDate(coupon.expiryDate) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-500">No coupons available</div>
              <div class="mt-4">
                <button @click="addCoupon" class="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  View More Coupons
                </button>
              </div>
            </div>
          </div>

          <!-- Cart Items Section -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b flex justify-between items-center">
              <h2 class="font-semibold text-lg text-gray-800">
                {{ storeName ? storeName : 'Store' }} Items
              </h2>
              <span class="text-sm text-gray-500">
                {{ storeItems.length }} {{ storeItems.length === 1 ? 'item' : 'items' }}
              </span>
            </div>
            
            <div v-if="storeItems.length === 0" class="p-6 text-center text-gray-500">
              No items in this store cart
            </div>
            
            <div v-else>
              <!-- Cart Items List -->
              <div class="divide-y">
                <div v-for="(item, index) in storeItems" :key="index" class="flex p-4 hover:bg-gray-50">
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
                  @click="clearStoreCart" 
                  class="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Clear Store Items
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
                <span class="text-gray-600">Discount ({{ coupons[selectedCoupon]?.couponDiscountPercentage }}%)</span>
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
              :disabled="storeItems.length === 0"
              :class="{'opacity-50 cursor-not-allowed': storeItems.length === 0}"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api.js'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import BackButton from '@/components/BackButton.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Setup router and route
const router = useRouter()
const route = useRoute()

// Data
const { userId, fetchUserId } = useFetchUserId()
const cart = ref([])
const locations = ref([])
const payments = ref([])
const coupons = ref([])
const shippingCost = ref(10)
const couponDiscountPercentage = ref(0)
const storeName = ref('')
const storeId = ref(null)

// Update menu state
const isMenuOpen = ref(false)
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState
}

// Selected location and payment
const selectedLocation = ref(null)
const selectedPayment = ref(null)
const selectedCoupon = ref(null)

// Tab management
const activeTab = ref('delivery')

// Loading and popup references
const durationWait = 1000
const loading = ref(false)
const popupRef = ref(null)

// Get store items (filtered by storeId from route query)
const storeItems = computed(() => {
  if (!storeId.value) return []
  
  return cart.value.filter(item => 
    item.userId === userId.value && 
    item.storeId.toString() === storeId.value.toString()
  )
})

// Calculate totals based on store items
const totalItems = computed(() => 
  storeItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const totalAmount = computed(() => 
  storeItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
)

const totalShippingCost = computed(() => {
  if (storeItems.value.length === 0) {
    return 0
  }
  return shippingCost.value
})

const calCouponDiscount = computed(() => {
  return (couponDiscountPercentage.value / 100) * totalAmount.value
})

const totalAmountAfterDiscountAndShipping = computed(() => {
  const discount = couponDiscountPercentage.value / 100
  return (totalAmount.value - (discount * totalAmount.value) - totalShippingCost.value).toFixed(2)
})

// Methods
const fetchLocations = async () => {
  try {
    const response = await api.get('/location')
    locations.value = response.data.map((loc) => ({
      address: loc.address,
      postalCode: loc.postalCode,
      region: loc.region,
      countryName: loc.countryName,
      countryCode: loc.countryCode,
      id: loc.id,
      userId: loc.userId,
    }))
  } catch (error) {
    console.error('Error fetching locations:', error)
  }
}

const fetchPayments = async () => {
  try {
    const response = await api.get('/payment')
    payments.value = response.data.map((payment) => ({
      id: payment.id,
      userId: payment.userId,
      paymentMethod: payment.paymentMethod,
      bankName: payment.bankName,
      accountOrCardNumber: payment.accountOrCardNumber,
      cardExpireDate: payment.cardExpireDate,
    }))
  } catch (error) {
    console.error('Error fetching payment methods:', error)
  }
}

const fetchCoupons = async () => {
  try {
    const response = await api.get('/couponuserlist')
    coupons.value = response.data
      .filter((coupon) => coupon.couponIsActive && !coupon.isUsed)
      .map((coupon) => ({
        id: coupon.id,
        couponId: coupon.couponId,
        userId: coupon.userId,
        couponCode: coupon.couponCode,
        couponDiscountPercentage: coupon.couponDiscountPercentage,
        couponDescription: coupon.couponDescription,
        expiryDate: coupon.expiryDate,
        isUsed: coupon.isUsed,
      }))
  } catch (error) {
    console.error('Error fetching coupons:', error)
  }
}

// Toggle selections
const toggleLocationSelection = (index) => {
  selectedLocation.value = selectedLocation.value === index ? null : index
}

const togglePaymentSelection = (index) => {
  selectedPayment.value = selectedPayment.value === index ? null : index
}

const toggleCouponSelection = (index) => {
  selectedCoupon.value = selectedCoupon.value === index ? null : index
  couponDiscountPercentage.value =
    selectedCoupon.value !== null ? coupons.value[selectedCoupon.value].couponDiscountPercentage : 0
}

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0]
}

// Cart item management methods
const increaseQuantity = (index) => {
  const item = storeItems.value[index]
  const cartIndex = cart.value.findIndex(cartItem => 
    cartItem.id === item.id && 
    cartItem.userId === userId.value
  )
  
  if (cartIndex !== -1) {
    cart.value[cartIndex].quantity++
    saveCart()
  }
}

const decreaseQuantity = (index) => {
  const item = storeItems.value[index]
  const cartIndex = cart.value.findIndex(cartItem => 
    cartItem.id === item.id && 
    cartItem.userId === userId.value
  )
  
  if (cartIndex !== -1) {
    if (cart.value[cartIndex].quantity > 1) {
      cart.value[cartIndex].quantity--
    } else {
      cart.value.splice(cartIndex, 1)
    }
    saveCart()
  }
}

const removeItem = (index) => {
  const item = storeItems.value[index]
  const cartIndex = cart.value.findIndex(cartItem => 
    cartItem.id === item.id && 
    cartItem.userId === userId.value
  )
  
  if (cartIndex !== -1) {
    cart.value.splice(cartIndex, 1)
    saveCart()
  }
}

// Clear store cart items
const clearStoreCart = () => {
  cart.value = cart.value.filter(item => 
    !(item.userId === userId.value && 
      item.storeId.toString() === storeId.value.toString())
  )
  saveCart()
}

// Save cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart.value))
}

// Navigation methods
const addPaymentMethod = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/payment')
  }, durationWait)
}

const addLocation = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/location')
  }, durationWait)
}

const addCoupon = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/coupon')
  }, durationWait)
}

// Checkout functionality
const proceedToOrder = async () => {
  if (storeItems.value.length === 0) {
    popupRef.value.show('Your cart is empty!', 'error')
    return
  }

  if (selectedLocation.value === null) {
    popupRef.value.show('Please select a delivery location before proceeding.', 'error')
    return
  }

  if (selectedPayment.value === null) {
    popupRef.value.show('Please select a payment method before proceeding.', 'error')
    return
  }

  try {
    loading.value = true
    const today = new Date().toISOString()
    const selectedCouponId =
      selectedCoupon.value !== null ? coupons.value[selectedCoupon.value].id : null
    const totalFinalAmount =
      totalAmount.value - ((couponDiscountPercentage.value / 100) * totalAmount.value) - totalShippingCost.value

    // Step 1: Create shipment
    const shipmentResponse = await api.post('/shipment', {
      trackingNumber: `TRK-${Date.now()}`,
      shippingCost: totalShippingCost.value,
      shipmentTypeId: 1,
      locationId: locations.value[selectedLocation.value].id,
    })
    const shipmentId = shipmentResponse.data.id

    // Step 2: Update coupon status and usage if selected
    if (selectedCouponId) {
      await api.put(`/couponuserlist/${selectedCouponId}`, {
        id: selectedCouponId,
        couponId: coupons.value[selectedCoupon.value].couponId,
        userId: userId.value,
        isUsed: true,
        usedDate: today,
        expiryDate: coupons.value[selectedCoupon.value].expiryDate,
      })
    }

    // Step 3: Create order
    const orderResponse = await api.post('/order', {
      orderNumber: `ORD-${Date.now()}`,
      orderDate: today,
      status: 'Pending',
      totalQuantity: totalItems.value,
      totalAmount: totalAmount.value,
      totalFinalAmount: totalFinalAmount.toFixed(2),
      couponUserListId: selectedCouponId,
      shipmentId: shipmentId,
      paymentId: payments.value[selectedPayment.value].id,
    })
    const orderId = orderResponse.data.id

    // Step 4: Create order items for this store only
    for (const item of storeItems.value) {
      await api.post('/orderitem', {
        orderId: orderId,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      })
    }

    // Clear only items from this store
    clearStoreCart()
    
    loading.value = false
    popupRef.value.show('Order placed successfully!', 'success')
    
    // Redirect to orders page
    setTimeout(() => {
      router.push('/order')
    }, durationWait)
  } catch (error) {
    loading.value = false
    console.error('An error occurred while placing the order:', error)
    popupRef.value.show('An error occurred while placing the order. Please try again.', 'error')
  }
}

// Initialize data on component mount
onMounted(async () => {
  loading.value = true
  
  try {
    // Get storeId from route query
    storeId.value = route.query.storeId
    
    // Load user data and cart
    await fetchUserId()
    cart.value = JSON.parse(localStorage.getItem('cart')) || []
    
    // Get store name from first item in filtered cart
    if (storeId.value) {
      const storeItems = cart.value.filter(item => 
        item.storeId.toString() === storeId.value.toString()
      )
      
      if (storeItems.length > 0) {
        storeName.value = storeItems[0].storeName
      }
    }
    
    // Fetch other required data
    await Promise.all([
      fetchLocations(),
      fetchPayments(),
      fetchCoupons()
    ])
  } catch (error) {
    console.error('Error initializing cart:', error)
    popupRef.value.show('Error loading cart data', 'error')
  } finally {
    loading.value = false
  }
})
</script>