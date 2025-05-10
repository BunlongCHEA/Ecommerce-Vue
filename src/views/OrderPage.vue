<template>
  <div class="order-page">
    <h1 class="page-title">Your Orders</h1>
    <div v-if="orders.length === 0" class="empty-state">No orders found.</div>
    <div v-else class="order-list">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-box"
        @click="goToOrderDetail(order.id)"
      >
        <h2 class="order-number">{{ order.orderNumber }}</h2>
        <p class="order-date">Order Date: {{ formatDate(order.orderDate) }}</p>
        <p class="order-status">Status: {{ order.status }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

const router = useRouter()
const orders = ref([])

// Fetch orders
const fetchOrders = async () => {
  try {
    const response = await api.get('/order')
    orders.value = response.data
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

// Navigate to order detail page
const goToOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

// Format date to readable format
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-page {
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-box {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #fff;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.3s;
}

.order-box:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.order-date,
.order-status {
  font-size: 1rem;
  color: #555;
}

.empty-state {
  text-align: center;
  font-size: 1.25rem;
  color: #999;
}
</style>
