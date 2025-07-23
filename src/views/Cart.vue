<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">
      
      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Products'"
        :destination="'/product'"
        :defaultTitle="'My Shopping Cart'"
        :waitDuration="durationWait"
      ></BackButton>

      <div class="container mx-auto px-4 py-6">
        <!-- Empty Cart Message -->
        <div v-if="Object.keys(storeGroups).length === 0" class="bg-white rounded-lg shadow-sm p-10 text-center">
          <div class="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Your cart is empty</h3>
            <p class="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <button 
              @click="goToProducts" 
              class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
        
        <!-- Store Groups Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(items, storeId) in storeGroups" 
            :key="storeId" 
            class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
          >
            <!-- Delete Store Cart Button -->
            <button 
              @click.stop="deleteStoreCart(storeId)"
              class="absolute top-4 right-4 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors z-10"
              title="Remove all items from this store"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="p-4 border-b">
              <div class="flex items-center">
                <h3 class="font-medium text-lg text-gray-800">{{ items[0].storeName }}</h3>
                <span class="bg-indigo-100 text-indigo-800 text-xs font-semibold py-1 px-2 rounded-full ml-3">
                  {{ items.length }} {{ items.length === 1 ? 'item' : 'items' }}
                </span>
              </div>
            </div>
            
            <!-- Preview of items with scrolling -->
            <div class="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div 
                v-for="(item, index) in items" 
                :key="index" 
                class="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div class="w-12 h-12 flex-shrink-0">
                  <img :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover rounded-md" />
                </div>
                <div class="ml-3 flex-grow overflow-hidden">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-sm font-medium text-green-600">${{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
            </div>
            
            <!-- Store subtotal -->
            <div class="p-4 bg-gray-50 flex justify-between items-center">
              <span class="text-sm text-gray-600">Subtotal:</span>
              <span class="font-semibold text-green-600">
                ${{ calculateStoreTotal(items).toFixed(2) }}
              </span>
            </div>
            
            <!-- View Store Cart button -->
            <div class="p-4 bg-white border-t">
              <button 
                @click="goToStoreCart(storeId)" 
                class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                View Store Cart
              </button>
            </div>
          </div>
        </div>
        
        <!-- Order Summary -->
        <div v-if="Object.keys(storeGroups).length > 0" class="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold mb-4">Cart Summary</h2>
          
          <div class="space-y-3 mb-6">
            <div v-for="(items, storeId) in storeGroups" :key="`summary-${storeId}`" class="flex justify-between">
              <span class="text-gray-600">{{ items[0].storeName }}</span>
              <span class="font-medium">${{ calculateStoreTotal(items).toFixed(2) }}</span>
            </div>
            
            <div class="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span class="text-green-600">${{ totalCartAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Info text display only (no navigation) -->
          <div class="text-center py-3 text-gray-700 font-medium flex items-center justify-center gap-2">
            <span>Total {{ totalCartItems }} {{ totalCartItems === 1 ? 'item' : 'items' }} in cart</span>
            <span class="text-green-600 font-bold">${{ totalCartAmount.toFixed(2) }}</span>
          </div>
          
          <!-- Last updated timestamp -->
          <div class="text-center text-xs text-gray-500 mt-2">
            Last updated: {{ formatDateTime() }}
          </div>
          
          <!-- <button 
            @click="checkoutAll" 
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Checkout All ({{ totalCartItems }} {{ totalCartItems === 1 ? 'item' : 'items' }})
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import BackButton from '@/components/BackButton.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
const { userId, fetchUserId } = useFetchUserId()
const router = useRouter()
const cart = ref([])
const loading = ref(false)
const popupRef = ref(null)
const durationWait = 1000

// Menu state
const isMenuOpen = ref(false)
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState
}

// Get cart items grouped by store
const storeGroups = computed(() => {
  // Filter cart items for current user
  const userItems = cart.value.filter(item => item.userId === userId.value)
  
  // Group by storeId
  return userItems.reduce((groups, item) => {
    const storeId = item.storeId.toString()
    if (!groups[storeId]) {
      groups[storeId] = []
    }
    groups[storeId].push(item)
    return groups
  }, {})
})

// Calculate total for all items
const totalCartAmount = computed(() => {
  return Object.values(storeGroups.value).reduce((total, items) => {
    return total + calculateStoreTotal(items)
  }, 0)
})

// Calculate total number of items
const totalCartItems = computed(() => {
  return Object.values(storeGroups.value).reduce((count, items) => {
    return count + items.reduce((sum, item) => sum + item.quantity, 0)
  }, 0)
})

// Calculate total for a specific store
const calculateStoreTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

// Format current date and time
const formatDateTime = () => {
  const now = new Date()
  
  // Format as YYYY-MM-DD HH:MM:SS
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Delete entire store cart
const deleteStoreCart = (storeId) => {
  // Show confirmation dialog
  if (confirm(`Are you sure you want to remove all items from this store?`)) {
    loading.value = true
    
    // Remove all items from this store in the cart
    cart.value = cart.value.filter(item => 
      !(item.userId === userId.value && item.storeId.toString() === storeId)
    )
    
    // Update localStorage with new cart data
    localStorage.setItem('cart', JSON.stringify(cart.value))
    
    // Show success message
    setTimeout(() => {
      loading.value = false
      if (popupRef.value) {
        popupRef.value.show('Store items removed successfully', 'success')
      }
    }, 500)
  }
}

// Navigation
const goToProducts = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/product')
  }, durationWait)
}

const goToStoreCart = (storeId) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push(`/cartitem?storeId=${storeId}`)
  }, durationWait)
}

const checkoutAll = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/checkout')
  }, durationWait)
}

// Load cart data on mount
onMounted(() => {
  fetchUserId() // Get the user ID first
  cart.value = JSON.parse(localStorage.getItem('cart')) || []
})
</script>

<style>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>