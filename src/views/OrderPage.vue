<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <LoadingOverlay :show="loading" />

    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-54': isMenuOpen }">
      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Products'"
        :destination="'/product'"
        :defaultTitle="'All Orders'"
        :waitDuration="durationWait"
      ></BackButton>

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
              <h3 class="text-lg font-bold text-gray-800">#{{ order.orderNumber }}</h3>
              <p class="font-bold">
                <span class="text-gray-600">Status: </span>
                <span class="text-purple-600">{{ order.status }}</span>
              </p>
              <p class="font-bold">
                <span class="text-gray-600">Order placed: </span>
                <span class="text-purple-600">{{ formatDate(order.orderDate) }}</span>
              </p>
            </div>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="font-bold text-gray-800">Order Info</p>
                <p class="font-bold text-green-600">Total Final Amount: ${{ order.totalFinalAmount }}</p>
                <p class="text-gray-600">Account Number: {{ order.accountOrCardNumber }}</p>
                <p class="text-gray-600">
                  Coupon: {{ order.couponCode || 'N/A' }}
                  <span v-if="order.couponDiscountPercentage">(%{{ order.couponDiscountPercentage }})</span>
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
              <ProgressBar
                :steps="statusSteps"
                :currentStatus="order.status"
                :order="order"
              />
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
                  <span v-if="order.couponDiscountPercentage">(-${{ order.couponDiscountPercentage }})</span>
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
            <!-- Progress Bar -->
            <div class="mt-6">
              <p class="text-gray-600">{{ getOrderStatusMessage(order) }}</p>
              <ProgressBar
                :steps="statusSteps"
                :currentStatus="order.status"
                :order="order"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="currentOrders.length === 0 && historyOrders.length === 0" class="text-center text-gray-500 text-lg py-12">
          No orders found.
        </div>
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
import ProgressBar from '@/components/ProgressBar.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'

// Data
// Update menu state
const isMenuOpen = ref(false);
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState;
}

// Loading and popup references
const durationWait = 1000 // 1 second
const loading = ref(false)

const router = useRouter()
const orders = ref([])
const currentOrders = ref([])
const historyOrders = ref([])

// Declare status steps for Progress Bar
const statusSteps = [
  { name: 'Pending', value: 'Pending', icon: 'fas fa-hourglass-start' },
  { name: 'Packing', value: 'Packing', icon: 'fas fa-box' },
  { name: 'Shipping', value: 'Shipping', icon: 'fas fa-truck' },
  { name: 'Delayed', value: 'Delayed', icon: 'fas fa-exclamation-triangle' },
  { name: 'Arrived', value: 'Arrived', icon: 'fas fa-check-circle' },
  { name: 'Completed', value: 'Completed', icon: 'fas fa-trophy' },
  { name: 'Cancelled', value: 'Cancelled', icon: 'fas fa-times-circle' },
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
    router.push(`/order/${orderId}`)
    loading.value = false
  }, durationWait)
}

// Format date to readable format
const formatDate = (dateString) => {
  const date = new Date(dateString)

  const localDateTime = date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  return localDateTime;

  // return new Date(dateString).toLocaleString(undefined, {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   second: '2-digit',
  //   hour12: false
  // })
}

// Get the progress width for the status bar
const getProgressWidth = (order) => {
  const currentIndex = statusSteps.findIndex(step => step.value === order.status)
  const progressPercentage = ((currentIndex + 1) / statusSteps.length) * 100
  return `${progressPercentage}%`
}

// Check if a step is completed
const isStepCompleted = (currentStatus, stepValue) => {
  const currentIndex = statusSteps.findIndex(step => step.value === currentStatus)
  const stepIndex = statusSteps.findIndex(step => step.value === stepValue)
  return stepIndex < currentIndex
}

// Get the current status message for the order
const getOrderStatusMessage = (order) => {
  // const statusStep = statusSteps.find(step => step.value === order.status)
  // return statusStep ? `${statusStep.name} as of ${formatDate(order.orderDate)}` : ''
  // Map of statuses to corresponding date fields
  const statusToDateFieldMap = ref({
    Pending: 'orderDate',
    Packing: 'packedDate',
    Shipping: 'shipmentDate',
    Delayed: 'delayedDateFrom',
    Arrived: 'arrivedDate',
    Completed: 'completedDate',
    Cancelled: 'cancelledDate',
  });

  // Get the date field based on the order status
  // statusToDateFieldMap: if order.status is Pending, dateField will be 'orderDate'.
  const dateField = statusToDateFieldMap.value[order.status];
  console.log('Date field:', dateField);

  // dateField : retrieve the actual date value from the order object, if dateField is 'orderDate', dateValue will be the value of order.orderDate.
  const dateValue = dateField ? order[dateField] : null;
  // const dateValueISO = dateValue + "Z";
  console.log('Formatted date:', formatDate(dateValue));

  // Return the formatted message if the date exists, otherwise return a default message
  return dateValue
    ? `${order.status} on ${formatDate(dateValue)}`
    : `${order.status} date not available`;
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
</style>