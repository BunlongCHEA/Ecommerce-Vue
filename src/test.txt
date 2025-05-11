<template>
  <div class="app-container">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Back Button -->
    <div class="action">
      <button @click="goBack" class="button">Back to Products</button>
    </div>

    <h1 class="title">Your Cart</h1>

    <!-- User Locations -->
    <div>
      <h2 class="subtitle">Delivery Locations</h2>
      <div v-if="locations.length > 0" class="location-grid">
        <div
          v-for="(loc, i) in locations"
          :key="i"
          class="location-box"
          :class="{ selected: selectedLocation === i }"
          @click="toggleLocationSelection(i)"
        >
          <div class="location-info">
            <p class="location-title">{{ loc.Address }}</p>
            <p class="location-detail">Postal Code: {{ loc.PostalCode }}</p>
            <p class="location-detail">Region: {{ loc.Region }}</p>
            <p class="location-detail">Country: {{ loc.CountryName }} ({{ loc.CountryCode }})</p>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">No locations available.</div>
      <div class="action">
        <button @click="addLocation" class="button primary">Manage Locations</button>
      </div>
    </div>

    <!-- Payment Methods Section -->
    <div>
      <h2 class="subtitle">Payment Methods</h2>
      <div v-if="payments.length > 0" class="payment-grid">
        <div
          v-for="(payment, index) in payments"
          :key="index"
          class="payment-box"
          :class="{ selected: selectedPayment === index }"
          @click="togglePaymentSelection(index)"
        >
          <div class="payment-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="payment-info">
            <p class="payment-method">{{ payment.PaymentMethod }}</p>
            <p class="payment-detail">Card/Account: {{ payment.AccountOrCardNumber }}</p>
            <p class="payment-detail">Expiry: {{ formatDate(payment.CardExpireDate) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">No payment methods available.</div>

      <!-- Add Payment Button -->
      <div class="action">
        <button @click="addPaymentMethod" class="button primary">Add Payment Method</button>
      </div>
    </div>

    <!-- Coupon Section -->
    <div>
      <h2 class="subtitle">Available Coupons</h2>
      <div v-if="coupons.length > 0" class="coupon-grid">
        <div
          v-for="(coupon, index) in coupons"
          :key="index"
          class="coupon-box"
          :class="{ selected: selectedCoupon === index }"
          @click="toggleCouponSelection(index)"
        >
          <p><strong>Code:</strong> {{ coupon.CouponCode }}</p>
          <p><strong>Discount:</strong> {{ coupon.CouponDiscountAmount }}%</p>
          <p><strong>Description:</strong> {{ coupon.CouponDescription }}</p>
          <p><strong>Expiry Date:</strong> {{ formatDate(coupon.ExpiryDate) }}</p>
        </div>
      </div>
      <div v-else class="empty-state">No coupons available.</div>
      <router-link to="/coupon" class="view-more"> View More Coupons </router-link>
    </div>

    <!-- Cart Items -->
    <div>
      <h2 class="subtitle">Cart Items</h2>
      <div v-if="cart.length === 0" class="empty-cart">Cart is empty.</div>
      <div v-else>
        <div class="table-header">
          <span class="col-product">Item Summary</span>
          <span class="col-qty">QTY</span>
          <span class="col-price">Price</span>
          <span class="col-total">Total Price</span>
        </div>
        <div class="item-scroll">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="col-product">
              <img :src="item.imageUrl" alt="Product Image" class="item-image" />
              <div>
                <h3 class="product-title">{{ item.name }}</h3>
              </div>
            </div>
            <div class="col-qty">
              <button @click="decreaseQuantity(index)" class="button">-</button>
              {{ item.quantity }}
              <button @click="increaseQuantity(index)" class="button">+</button>
              <button @click="removeItem(index)" class="button danger">Remove</button>
            </div>
            <div class="col-price">
              ${{ item.price.toFixed(2) }}
              <span v-if="item.discountAmount" class="discount">(-{{ item.discountAmount }}%)</span>
            </div>
            <div class="col-total">${{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
        <button @click="clearCart" class="button danger">Clear All</button>
      </div>
    </div>

    <!-- Total -->
    <div class="total">
      <h2>Total</h2>
      <p>Total Items: {{ totalItems }}</p>
      <p>Total Amount: ${{ totalAmount.toFixed(2) }}</p>
      <p>Total Amount After Discount: ${{ totalAmountAfterDiscount }}</p>
      <!-- <p>
        Total Amount After Discount: $
        {{
          isNaN((totalAmount - (discountAmount.value / 100) * totalAmount).toFixed(2))
            ? totalAmount.toFixed(2)
            : (totalAmount - (discountAmount.value / 100) * totalAmount).toFixed(2)
        }}
      </p> -->
      <!-- <p>{{ discountAmount.value }}</p> -->
    </div>

    <!-- Proceed Button -->
    <div class="action">
      <button @click="proceedToOrder" class="button primary">Proceed to Order</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// Data
const router = useRouter()
const cart = ref([])
const locations = ref([])
const payments = ref([])
const coupons = ref([])
// const discountAmount = ref(0)
const couponDiscountAmount = ref(0)
const userId = ref(null) // Track logged-in user ID

// Selected location and payment
const selectedLocation = ref(null) // Track selected location index
const selectedPayment = ref(null) // Track selected payment index
const selectedCoupon = ref(null) // Track selected coupon index

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

const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
const totalAmount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity * item.price, 0),
)
console.log('Total Amount:', totalAmount.value)
console.log('Total Items:', totalItems.value)
const totalAmountAfterDiscount = computed(() => {
  const discount = couponDiscountAmount.value / 100
  return (totalAmount.value - discount * totalAmount.value).toFixed(2)
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
    const amountAfterDiscount =
      totalAmount.value - (couponDiscountAmount.value / 100) * totalAmount.value
    console.log('Selected Coupon ID:', selectedCouponId)
    console.log('Amount after discount:', amountAfterDiscount)

    // Step 1: Create shipment
    console.log('locationId:', locations.value[selectedLocation.value].Id)
    const shipmentResponse = await api.post('/shipment', {
      trackingNumber: `TRK-${Date.now()}`,
      shipmentDate: new Date().toISOString(),
      shippingCost: 10.0,
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
      amountAfterDiscount: amountAfterDiscount.toFixed(2),
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

    popupRef.value.show('Order placed successfully!', 'success')
    cart.value = []
    localStorage.removeItem('cart')
    router.push('/order')
  } catch (error) {
    console.error('An error occurred while placing the order. Please try again:', error)
    popupRef.value.show('An error occurred while placing the order. Please try again.', 'error')
  }
}

// Redirect to add payment route
const addPaymentMethod = () => {
  router.push('/payment')
}

// Redirect to add location route
const addLocation = () => {
  router.push('/location')
}

const goBack = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/product')
  }, durationWait)
}

const increaseQuantity = (index) => {
  cart.value[index].quantity++
  saveCart()
}

const decreaseQuantity = (index) => {
  if (cart.value[index].quantity > 1) {
    cart.value[index].quantity--
  } else {
    cart.value.splice(index, 1)
  }
  saveCart()
}

const removeItem = (index) => {
  cart.value.splice(index, 1)
  saveCart()
}

const clearCart = () => {
  cart.value = []
  localStorage.removeItem('cart')
}

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
/* Adjusted layout to fit full screen */
.app-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  /* overflow-y: auto; */
  background: transparent;
}

/* Payment grid & Location grid & box styles */
.coupon-grid,
.location-grid,
.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.coupon-box,
.location-box,
.payment-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.3s,
    transform 0.2s,
    box-shadow 0.3s;
}

.coupon-box:hover,
.location-box:hover,
.payment-box:hover {
  cursor: pointer;
  background-color: #ffeeba;
  transform: scale(1.02); /* Slightly enlarge on hover */
}

/* Selected state styling (remains orange until user selects another box) */
.selected {
  border: 2px solid orange; /* Orange border for selected items */
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.5); /* Subtle orange glow */
  background-color: #ffeeba; /* Light orange background for selected items */
}

.payment-icon {
  font-size: 2rem;
  color: #007bff;
}

.location-info,
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.location-title,
.payment-method {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.location-detail,
.payment-detail {
  color: #777;
}

.empty-state {
  text-align: center;
  font-size: 1.25rem;
  color: #999;
}

/* Discount Text */
.discount {
  color: red;
  font-size: 14px;
  margin-left: 5px;
  font-weight: bold;
}

/* All Text, Button */
.title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  color: #333;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}

.button.danger {
  background-color: #dc3545;
}

.button.danger:hover {
  background-color: #a71d2a;
}

.button.primary {
  background-color: #28a745;
}

.button.primary:hover {
  background-color: #218838;
}

/* Cart Items Table */
.empty-cart {
  color: #999;
  font-style: italic;
}

.table-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  font-weight: bold;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.cart-item {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.total {
  font-size: 1.25rem;
  font-weight: bold;
  border-top: 1px solid #ccc;
  padding-top: 1rem;
  text-align: center;
}

.action {
  text-align: center;
}
</style>
