<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <LoadingOverlay :show="loading" />
    
    <!-- Back Button & Title Component -->
    <BackButton
      :buttonLabel="'Back to Products'"
      :destination="'/product'"
      :defaultTitle="'All Orders'"
      :waitDuration="durationWait"
    ></BackButton>

    <!-- Page Title -->
    <!-- <div class="py-8 bg-gray-100 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-center text-gray-800">Your Orders</h1>
    </div> -->

    <div class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Current Orders Section -->
      <div v-if="currentOrders.length > 0" class="mb-12">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Current Orders</h2>
        <div
          v-for="order in currentOrders"
          :key="order.id"
          class="bg-white shadow border border-gray-200 rounded-lg p-6 mb-4 cursor-pointer hover:shadow-lg transition"
          @click="goToOrderDetail(order.id)"
        >
          <div class="flex justify-between">
            <h3 class="text-lg font-bold text-gray-800">Order #{{ order.orderNumber }}</h3>
            <p class="text-gray-500 text-sm">Order placed {{ formatDate(order.orderDate) }}</p>
          </div>
          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="font-bold text-gray-800">Order Info</p>
              <p class="font-bold text-green-600">Total Final Amount: ${{ order.totalFinalAmount }}</p>
              <p class="text-gray-600">Account Number: {{ order.accountOrCardNumber }}</p>
              <p class="text-gray-600">
                Coupon Code: {{ order.couponCode || 'N/A' }}
                <span v-if="order.couponDiscountAmount">(%{{ order.couponDiscountAmount }})</span>
              </p>
            </div>
            <div>
              <p class="font-bold text-gray-800">Delivery Address</p>
              <p class="text-gray-600">Address: {{ order.countryName || 'N/A' }}, {{ order.region || 'N/A' }}, {{ order.address || 'N/A' }}</p>
              <p class="text-gray-600">Postal Code: {{ order.postalCode || 'N/A' }}</p>
              <p class="text-gray-600">Mobile Number: {{ order.phoneNumber || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-bold text-gray-800">Shipping Info</p>
              <p class="text-gray-600">Tracking Number: {{ order.trackingNumber || 'N/A' }}</p>
              <p class="text-gray-600">Shipping Cost: ${{ order.shippingCost.toFixed(2) || 0.00 }}</p>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="mt-6">
            <p class="text-gray-600">{{ getOrderStatusMessage(order) }}</p>
            <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span
                v-for="step in statusSteps"
                :key="step.name"
                :class="{ 'text-purple-600 font-medium': step.value === order.status }"
              >
                {{ step.name }}
              </span>
            </div>
            <div class="relative mt-2">
              <div class="h-2 bg-gray-200 rounded-full"></div>
              <div
                class="h-2 bg-purple-600 rounded-full absolute top-0"
                :style="{ width: getProgressWidth(order) }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Orders Section -->
      <div v-if="historyOrders.length > 0">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Order History</h2>
        <div
          v-for="order in historyOrders"
          :key="order.id"
          class="bg-white shadow border border-gray-200 rounded-lg p-6 mb-4 cursor-pointer hover:shadow-lg transition"
          @click="goToOrderDetail(order.id)"
        >
          <div class="flex justify-between">
            <h3 class="text-lg font-bold text-gray-800">Order #{{ order.orderNumber }}</h3>
            <p class="text-gray-500 text-sm">
              {{ order.status === 'Cancelled' ? 'Cancelled on' : 'Completed on' }}
              {{ formatDate(order.cancelledDate || order.completedDate) }}
            </p>
          </div>
          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-gray-600">Amount After Discount: ${{ order.amountAfterDiscount }}</p>
              <p class="text-gray-600">Account/Card Number: {{ order.accountOrCardNumber }}</p>
              <p class="text-gray-600">
                Coupon Code: {{ order.couponCode || 'N/A' }}
                <span v-if="order.couponDiscountAmount">(-${{ order.couponDiscountAmount }})</span>
              </p>
            </div>
            <div>
              <p class="text-gray-600">Delivery Address: {{ order.deliveryAddress }}</p>
            </div>
            <div>
              <p class="text-gray-600">Shipping Updates: {{ order.shippingUpdates }}</p>
              <p class="text-gray-600">Tracking Number: {{ order.trackingNumber || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="currentOrders.length === 0 && historyOrders.length === 0" class="text-center text-gray-500 text-lg py-12">
        No orders found.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

import BackButton from '@/components/BackButton.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// Data
// Loading and popup references
const durationWait = 1000 // 1 second
const loading = ref(false)

const router = useRouter()
const orders = ref([])
const currentOrders = ref([])
const historyOrders = ref([])

const statusSteps = [
  { name: 'Pending', value: 'Pending' },
  { name: 'Packing', value: 'Packing' },
  { name: 'Shipping', value: 'Shipping' },
  { name: 'Arrived', value: 'Arrived' },
  { name: 'Completed', value: 'Completed' },
  { name: 'Cancelled', value: 'Cancelled' },
]

// Methods
// Fetch orders
const fetchOrders = async () => {
  try {
    const response = await api.get('/order')
    orders.value = response.data
    console.log('Orders response:', orders.value)

    // Separate current orders and history orders
    currentOrders.value = orders.value.filter(order => order.status !== 'Completed' && order.status !== 'Cancelled')
    historyOrders.value = orders.value.filter(order => order.status === 'Completed' || order.status === 'Cancelled')
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

// Navigate to order detail page
const goToOrderDetail = (orderId) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push(`/order/${orderId}`)
  }, durationWait)
}

// Format date to readable format
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Get the progress width for the status bar
const getProgressWidth = (order) => {
  const currentIndex = statusSteps.findIndex(step => step.value === order.status)
  const progressPercentage = ((currentIndex + 1) / statusSteps.length) * 100
  return `${progressPercentage}%`
}

// Get the current status message for the order
const getOrderStatusMessage = (order) => {
  const statusStep = statusSteps.find(step => step.value === order.status)
  return statusStep ? `${statusStep.name} as of ${formatDate(order.orderDate)}` : ''
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
</style>