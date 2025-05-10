<template>
  <div class="order-detail">
    <div v-if="loading">Loading order details...</div>

    <div v-else-if="order">
      <div class="header-section">
        <div class="header-box">
          <h1 class="order-number">Order Number: {{ order.orderNumber }}</h1>
          <p class="order-date">Order Created: {{ formatDate(order.orderDate) }}</p>
          <p class="order-status">Status: {{ order.status }}</p>
        </div>
      </div>

      <!-- Redesigned Status Timeline with Progress Bar -->
      <div class="tracking-section">
        <div class="status-box">
          <!-- Current Status Information -->
          <div class="current-status-info">
            <h2>{{ getCurrentStatusMessage }}</h2>
            <div v-if="getStatusDetails" class="status-details">
              {{ getStatusDetails }}
            </div>
          </div>

          <!-- Status Progress Bar -->
          <div class="status-timeline">
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: calculateStatusProgress + '%' }"></div>
              </div>
              <div class="progress-steps">
                <div
                  v-for="(step, index) in statusSteps"
                  :key="index"
                  class="progress-step"
                  :class="{
                    current: step.name === order.status,
                    completed: isStepCompleted(step.name),
                  }"
                >
                  <div class="step-marker"></div>
                  <div class="step-content">
                    <p class="step-name">{{ step.name }}</p>
                    <p class="step-date">{{ statusDates[step.name] || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="item-summary">
          <div class="table-header">
            <span class="col-product">Item Summary</span>
            <span class="col-qty">QTY</span>
            <span class="col-price">Price</span>
            <span class="col-total">Total Price</span>
          </div>
          <div class="item-scroll">
            <div v-for="item in orderItems" :key="item.id" class="item-row">
              <div class="col-product">
                <img :src="item.imageUrl" alt="Product Image" class="item-image" />
                <div>
                  <h3 class="product-title">{{ item.productName }}</h3>
                  <p class="product-color">Colour: Blue</p>
                </div>
              </div>
              <div class="col-qty">x{{ item.quantity }}</div>
              <div class="col-price">${{ item.price.toFixed(2) }}</div>
              <div class="col-total">${{ item.totalPrice.toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2>Order Summary</h2>
          <p>Subtotal: ${{ subtotal.toFixed(2) }}</p>
          <p>Delivery Fee: $0.00</p>
          <p class="discount">Coupon Discount(%): -${{ couponDiscount.toFixed(2) }}</p>
          <p class="summary-total">Total: ${{ amountAfterDiscount.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api.js'

const route = useRoute()
const orderId = route.params.orderId

const order = ref(null)
const orderItems = ref([])
const loading = ref(true)
const discountAmount = ref(0)
const couponDiscount = ref(0)
const amountAfterDiscount = ref(0)

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
      }

      // Populate discount amount & amount after discount
      couponDiscount.value = firstOrder.couponDiscount ?? 0
      console.log('Coupon Discount:', firstOrder.couponDiscount)

      amountAfterDiscount.value = firstOrder.amountAfterDiscount ?? 0
      console.log('Amount After Discount:', amountAfterDiscount.value)

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
  if (order.value.status === 'Cancelled') {
    return stepName === 'Cancelled'
  }

  return stepIndex < currentIndex
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
.order-detail {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-box {
  flex: 1;
}

/* New tracking section */
.tracking-section {
  margin-bottom: 2rem;
}

.status-box {
  width: 100%;
}

/* Current Status Information */
.current-status-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4e42d4;
}

.current-status-info h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.status-details {
  color: #666;
  font-size: 0.9rem;
}

/* Status Timeline Styles */
.status-timeline {
  margin-top: 2rem;
}

.progress-container {
  position: relative;
  width: 100%;
  margin: 20px 0;
}

.progress-bar {
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  position: relative;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background-color: #4e42d4; /* Purple color like in the image */
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: -12px;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: calc(100% / 6); /* For 6 status steps */
  position: relative;
}

.step-marker {
  width: 16px;
  height: 16px;
  background-color: #e0e0e0;
  border-radius: 50%;
  margin-bottom: 8px;
  z-index: 2;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #e0e0e0;
}

.progress-step.current .step-marker {
  background-color: #4e42d4;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #4e42d4;
}

.progress-step.completed .step-marker {
  background-color: #4e42d4;
}

.step-content {
  padding-top: 10px;
}

.step-name {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.progress-step.current .step-name {
  color: #4e42d4;
  font-weight: bold;
}

.step-date {
  font-size: 0.75rem;
  color: #666;
}

/* Content section */
.content-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 1rem;
}

.item-summary {
  flex: 2;
  max-height: 400px;
  width: 100%;
}

.table-header {
  display: flex;
  font-weight: bold;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.item-scroll {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.col-product {
  display: flex;
  align-items: center;
  flex: 3;
  gap: 1rem;
}

.col-qty,
.col-price,
.col-total {
  flex: 1;
  text-align: center;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.product-title {
  font-weight: 500;
}

.product-color {
  font-size: 0.85rem;
  color: #888;
}

.order-summary {
  flex: 1;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  min-width: 250px;
}

.summary-total {
  font-weight: bold;
  color: green;
  margin-top: 1rem;
}

.discount {
  font-weight: bold;
  color: red;
  margin-top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .progress-step {
    width: calc(100% / 6); /* Keep equal width for mobile */
  }

  .step-name {
    font-size: 0.7rem;
  }

  .step-date {
    font-size: 0.6rem;
  }

  .content-section {
    flex-direction: column;
  }

  .order-summary {
    width: 100%;
  }
}
</style>
