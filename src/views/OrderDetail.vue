<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <!-- Back Button & Title Component -->
    <BackButton
      :buttonLabel="'Back to Orders'"
      :destination="'/order'"
      :defaultTitle="'All Order Details'"
      :waitDuration="durationWait"
    ></BackButton>

    <div class="order-detail w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 mx-auto">
      <div v-if="loading" class="text-lg font-semibold text-center">Loading order details...</div>

      <div v-else-if="order">
        <!-- Header Section -->
        <div class="header-section mb-8 flex justify-between items-center lg:flex-nowrap lg:gap-10">
          <!-- Order Number -->
          <div class="header-box flex-1 text-left">
            <h1 class="text-2xl font-bold text-gray-800">Order Number: {{ order.orderNumber }}</h1>
            <p class="text-gray-600">Order Created: {{ formatDate(order.orderDate) }}</p>
            <p class="text-gray-600">Status: {{ order.status }}</p>
            <p class="text-gray-600 font-medium">Tracking Number: {{ order.trackingNumber }}</p>
          </div>

          <!-- Delivery Location and Tracking Number -->
          <div class="delivery-info flex-1 text-right">
            <p class="text-lg font-semibold text-gray-800">Delivery Location:</p>
            <p class="text-gray-600">{{ order.countryName }}, {{ order.region }}</p>
            <p class="text-gray-600">{{ order.address }}, {{ order.postalCode }}</p>
          </div>
        </div>

        <!-- Redesigned Status Timeline with Progress Bar -->
        <div class="tracking-section mb-8">
          <div class="status-box">
            <!-- Current Status Information -->
            <div class="current-status-info bg-white shadow-md rounded-lg p-4 border-l-4 border-purple-600">
              <h2 class="font-semibold text-lg text-gray-800">{{ getCurrentStatusMessage }}</h2>
              <div v-if="getStatusDetails" class="text-gray-600 text-sm">
                {{ getStatusDetails }}
              </div>
            </div>

            <!-- Status Progress Bar -->
            <div class="status-timeline mt-6">
              <div class="progress-container relative w-full">
                <div class="progress-bar h-2 bg-gray-300 rounded">
                  <div class="progress-fill h-full bg-purple-600 rounded transition-all" :style="{ width: calculateStatusProgress + '%' }"></div>
                </div>
                <div class="progress-steps flex justify-between mt-2">
                  <div
                    v-for="(step, index) in statusSteps"
                    :key="index"
                    class="progress-step flex flex-col items-center text-center w-1/6 relative"
                    :class="{
                      'text-purple-600 font-bold': step.name === order.status,
                      'text-gray-500': !isStepCompleted(step.name),
                      'text-purple-600': isStepCompleted(step.name),
                    }"
                  >
                    <div class="step-marker w-4 h-4 bg-gray-300 rounded-full mb-2 border-2 border-white shadow"
                      :class="{
                        'bg-purple-600': isStepCompleted(step.name),
                      }"
                    ></div>
                    <div class="step-content">
                      <p class="step-name text-sm">{{ step.name }}</p>
                      <p class="step-date text-xs text-gray-500">{{ statusDates[step.name] || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-section flex flex-col lg:flex-row gap-6">
          <div class="item-summary flex-1 bg-white shadow-md rounded-lg p-4">
            <div class="table-header flex justify-between font-semibold text-gray-800 bg-gray-100 rounded p-2">
              <span class="col-product">Item Summary</span>
              <span class="col-qty">QTY</span>
              <span class="col-price">Price</span>
              <span class="col-total">Total Price</span>
            </div>
            <div class="item-scroll divide-y divide-gray-200 mt-4">
              <div v-for="item in orderItems" :key="item.id" class="item-row flex items-center py-4">
                <div class="col-product flex-1 flex items-center gap-4">
                  <img :src="item.imageUrl" alt="Product Image" class="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 class="product-title font-medium text-gray-800">{{ item.productName }}</h3>
                    <p class="product-color text-sm text-gray-500">Colour: Blue</p>
                  </div>
                </div>
                <div class="col-qty w-16 text-center">x{{ item.quantity }}</div>
                <div class="col-price w-24 text-center">${{ item.price.toFixed(2) }}</div>
                <div class="col-total w-24 text-center">${{ item.totalPrice.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- <div class="order-summary bg-white shadow-md rounded-lg p-4 w-full lg:w-1/4">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            <p class="text-gray-600">Subtotal: <span class="font-medium">${{ subtotal.toFixed(2) }}</span></p>
            <p class="text-red-600">Delivery Fee: <span class="font-medium">-${{ shippingCost.toFixed(2) }}</span></p>
            <p class="text-red-600">Coupon Discount: -${{ couponDiscount.toFixed(2) }}</p>
            <p class="summary-total text-green-600 font-bold text-lg mt-4">Total: ${{ amountAfterDiscount.toFixed(2) }}</p>
          </div> -->

          <div class="lg:w-1/3">
            <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div class="space-y-3 mb-6">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-medium text-green-600">${{ subtotal.toFixed(2) }}</span>
                </div>
                
                <div class="flex justify-between" v-if="couponDiscount > 0">
                  <span class="text-gray-600">Discount</span>
                  <span class="font-medium text-red-600">-${{ calCouponDiscount.toFixed(2) }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-600">Shipping Fee</span>
                  <span class="font-medium text-red-600">-${{ shippingCost.toFixed(2) }}</span>
                </div>
                
                <div class="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${{ totalFinalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api.js'

import BackButton from '@/components/BackButton.vue'

const durationWait = 1000
const route = useRoute()
const orderId = route.params.orderId

const order = ref(null)
const orderItems = ref([])
const loading = ref(true)
const couponDiscount = ref(0)
const shippingCost = ref(0)
const totalFinalAmount = ref(0)

const statusSteps = [
  { name: 'Pending', icon: 'fas fa-hourglass-start' },
  { name: 'Packing', icon: 'fas fa-box' },
  { name: 'Shipping', icon: 'fas fa-truck' },
  { name: 'Arrived', icon: 'fas fa-check-circle' },
  { name: 'Completed', icon: 'fas fa-trophy' },
  { name: 'Cancelled', icon: 'fas fa-times-circle' },
]

const statusDates = ref({
  Pending: null,
  Packing: null,
  Shipping: null,
  Arrived: null,
  Completed: null,
  Cancelled: null,
})

// Computed property to get the current status message
const getCurrentStatusMessage = computed(() => {
  if (!order.value) return ''

  switch (order.value.status) {
    case 'Pending':
      return 'Order Placed on ' + formatDate(statusDates.value.Pending)
    case 'Packing':
      return 'Packing your package order on ' + formatDate(statusDates.value.Packing)
    case 'Shipping':
      return 'Preparing to ship on ' + formatDate(statusDates.value.Shipping)
    case 'Arrived':
      return 'Package Arrived'
    case 'Completed':
      return 'Order Completed on ' + formatDate(statusDates.value.Completed)
    case 'Cancelled':
      return 'Order Cancelled on ' + formatDate(statusDates.value.Cancelled)
    default:
      return order.value.status
  }
})

// Computed property to get additional status details
const getStatusDetails = computed(() => {
  if (!order.value) return ''

  switch (order.value.status) {
    case 'Shipping':
      // Calculate expected delivery date (+10 days from shipment date)
      const shipmentDate = statusDates.value.Shipping ? new Date(statusDates.value.Shipping) : null
      if (shipmentDate) {
        const expectedDate = new Date(shipmentDate)
        expectedDate.setDate(expectedDate.getDate() + 10)
        return `Shipment Date: ${formatDate(shipmentDate)} | Expected Delivery: ${formatDate(expectedDate)}`
      }
      return null
    case 'Arrived':
      return `Delivered on ${formatDate(statusDates.value.Arrived)}`
    default:
      return null
  }
})

const fetchOrderDetail = async () => {
  try {
    const response = await api.get(`/orderitem/${orderId}`)
    console.log('Order detail response:', response.data)

    if (response.data.length > 0) {
      const firstOrder = response.data[0]

      // Populate order object
      order.value = {
        orderNumber: firstOrder.orderNumber,
        orderDate: firstOrder.orderDate,
        status: firstOrder.status,
        trackingNumber: firstOrder.trackingNumber,
        address: firstOrder.address,
        postalCode: firstOrder.postalCode,
        region: firstOrder.region,
        countryName: firstOrder.countryName,
      }

      // Populate discount amount & amount after discount
      couponDiscount.value = firstOrder.couponDiscount ?? 0
      console.log('Coupon Discount:', firstOrder.couponDiscount)

      totalFinalAmount.value = firstOrder.totalFinalAmount ?? 0
      console.log('Amount After Discount:', totalFinalAmount.value)

      shippingCost.value = firstOrder.shippingCost ?? 0
      console.log('Shipping Cost:', shippingCost.value)

      // Populate order items
      orderItems.value = response.data.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
        productName: item.productName,
        imageUrl: item.imageUrl,
      }))

      // Populate statusDates dynamically from the API response
      statusDates.value = {
        Pending: formatDate(firstOrder.orderDate),
        Packing: formatDate(firstOrder.packingDate || firstOrder.shipmentDate),
        Shipping: formatDate(firstOrder.shipmentDate),
        Arrived: formatDate(firstOrder.arrivedDate),
        Completed: formatDate(firstOrder.completedDate),
        Cancelled: formatDate(firstOrder.cancelledDate),
      }
      console.log('Status dates:', statusDates.value)
    } else {
      console.error('No order found for the given ID')
    }
  } catch (error) {
    console.error('Error fetching order details:', error)
    order.value = null
  } finally {
    loading.value = false
  }
}

const subtotal = computed(() => orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0))

const calCouponDiscount = computed(() => {
  return (couponDiscount.value / 100) * subtotal.value
})

// Calculate progress for status timeline
const calculateStatusProgress = computed(() => {
  const currentIndex = statusSteps.findIndex((step) => step.name === order.value?.status)
  if (currentIndex === -1) return 0

  // Skip "Cancelled" status in progress calculation if not cancelled
  const totalSteps =
    order.value?.status === 'Cancelled' ? statusSteps.length : statusSteps.length - 1
  return Math.min(100, ((currentIndex + 1) / totalSteps) * 100)
})

// Check if a status step is completed
const isStepCompleted = (stepName) => {
  if (!order.value) return false

  const stepIndex = statusSteps.findIndex((step) => step.name === stepName)
  const currentIndex = statusSteps.findIndex((step) => step.name === order.value.status)

  // Special handling for Cancelled status
  // if (order.value.status === 'Cancelled') {
  //   return stepName === 'Cancelled'
  // }

  // return stepIndex < currentIndex
  return order.value.status === 'Cancelled' ? stepName === 'Cancelled' : stepIndex < currentIndex
}

const formatDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>

</style>
