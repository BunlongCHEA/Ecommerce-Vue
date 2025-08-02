<template>
  <div class="flex flex-col w-full min-h-screen bg-gray-50">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Fixed hamburger menu container -->
    <div class="fixed top-0 left-0 z-40 h-16 w-16 flex items-center justify-center">
      <HamburgerMenu @menu-toggle="handleMenuToggle" />
    </div>

    <!-- Header Section with margin-left to make space for hamburger button -->
    <div 
      class="flex justify-between items-center w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-in-out"
      :class="{ 'translate-x-64': isMenuOpen }"
    >
      <!-- Left: Back Button -->
      <!-- <BackButton
        :buttonLabel="'Back to Products'"
        :destination="'/product'"
        :defaultTitle="'Product Management'"
        :waitDuration="1000"
      ></BackButton> -->
      <!-- <button 
        @click="goBack"
        class="flex items-center text-white hover:text-gray-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Products
      </button> -->

      <!-- Right: Cart and User Profile -->
      <div class="flex items-center gap-5 ml-auto">
        <!-- Cart Button -->
        <button class="relative text-4xl text-white hover:text-gray-200 transition-colors" @click="navigateToCart">
          <i class="cart-icon">🛒</i>
          <span 
            v-if="cartTotalQuantity > 0" 
            class="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >{{ cartTotalQuantity }}</span>
        </button>

        <!-- User Profile Button -->
        <button class="text-4xl text-white hover:text-gray-200 transition-colors">
          <img v-if="userImage" :src="userImage" alt="User Profile" class="w-8 h-8 rounded-full" />
          <i v-else>👤</i>
        </button>
      </div>
    </div>

    <!-- Main Content with transition effect -->
    <div 
      class="flex flex-col w-full transition-all duration-500 ease-in-out p-6"
      :class="{ 'translate-x-64': isMenuOpen }"
    >
      <!-- Product Detail Container -->
      <div v-if="product" class="max-w-7xl mx-auto w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left Side: Product Images -->
          <div class="space-y-4">
            <!-- Main Product Image -->
            <div class="aspect-square w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                :src="selectedImage" 
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                @error="handleImageError($event)"
              />
            </div>

            <!-- Thumbnail Images -->
            <div class="flex gap-3 justify-center flex-wrap">
              <div 
                v-for="(image, index) in productImages" 
                :key="index"
                class="w-20 h-20 bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-2 transition-all duration-200"
                :class="selectedImage === image ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'"
                @click="selectImage(image)"
              >
                <img 
                  :src="image" 
                  :alt="`${product.name} view ${index + 1}`"
                  class="w-full h-full object-cover"
                  @error="handleImageError($event)"
                />
              </div>
            </div>
          </div>

          <!-- Right Side: Product Information -->
          <div class="space-y-6">
            <!-- Product Name -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
              <p class="text-lg text-gray-600">{{ product.storeName }}</p>
            </div>

            <!-- Price -->
            <div class="flex items-center gap-4">
              <span class="text-3xl font-bold text-gray-900">
                ${{ finalPrice.toFixed(2) }}
              </span>
              <span 
                v-if="product.discountPercentage && product.discountPercentage > 0" 
                class="text-xl text-gray-500 line-through"
              >
                ${{ product.price.toFixed(2) }}
              </span>
              <span 
                v-if="product.discountPercentage && product.discountPercentage > 0" 
                class="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded"
              >
                -{{ product.discountPercentage }}%
              </span>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-2">
              <div class="flex items-center">
                <div class="flex">
                  <svg 
                    v-for="star in 5" 
                    :key="star"
                    class="w-5 h-5"
                    :class="star <= Math.floor(product.rating || 4.0) ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700 ml-2">{{ (product.rating || 4.0).toFixed(1) }}</span>
              </div>
              <span class="text-sm text-blue-600 hover:underline cursor-pointer">
                See all {{ product.reviewCount || 512 }} reviews
              </span>
            </div>

            <!-- Colors -->
            <div v-if="availableColors.length > 0">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Color</h3>
              <div class="flex gap-3">
                <button
                  v-for="color in availableColors"
                  :key="color.name"
                  class="w-8 h-8 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :class="selectedColor === color.name ? 'border-gray-900 ring-2 ring-blue-200' : 'border-gray-300'"
                  :style="{ backgroundColor: color.value }"
                  @click="selectColor(color.name)"
                  :title="color.name"
                ></button>
              </div>
            </div>

            <!-- Sizes -->
            <div v-if="availableSizes.length > 0">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-medium text-gray-900">Size</h3>
                <button class="text-sm text-blue-600 hover:underline">Size chart</button>
              </div>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="size in availableSizes"
                  :key="size"
                  class="px-4 py-3 text-sm font-medium border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="selectedSize === size 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'"
                  @click="selectSize(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
              <div class="flex items-center gap-3">
                <button 
                  @click="decreaseQuantity"
                  class="w-10 h-10 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <input 
                  type="number" 
                  v-model="quantity" 
                  min="1"
                  max="99"
                  class="w-20 h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  @click="increaseQuantity"
                  class="w-10 h-10 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Add to Cart Button -->
            <button 
              @click="addToCart"
              class="w-full py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding to cart...
              </span>
              <span v-else>Add to cart</span>
            </button>

            <!-- Description -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <div class="prose prose-sm text-gray-700 leading-relaxed">
                <p>{{ product.description || 'This product offers exceptional quality and comfort. Perfect for everyday use with a modern design that complements any style.' }}</p>
                
                <p v-if="!product.description" class="mt-4">
                  Looking to stock your closet? This item also comes in a 
                  3-pack or 5-pack at a bundle discount.
                </p>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="border-t pt-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium text-gray-900">Category:</span>
                  <span class="text-gray-600 ml-1">{{ product.categoryName }}</span>
                </div>
                <div>
                  <span class="font-medium text-gray-900">Brand:</span>
                  <span class="text-gray-600 ml-1">{{ product.subCategoryName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else class="flex flex-col items-center justify-center h-96">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <p class="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          @click="goBack"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import BackButton from '@/components/BackButton.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Router and route
const route = useRoute()
const router = useRouter()

// Composables
const { userId, fetchUserId } = useFetchUserId()

// State
const isMenuOpen = ref(false)
const loading = ref(false)
const popupRef = ref(null)
const product = ref(null)
const userImage = ref(null)
const cartTotalQuantity = ref(0)

// Product detail state
const selectedImage = ref('')
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)

// Sample data for demonstration (in real app, this would come from the product data)
const availableColors = ref([
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Navy', value: '#1E3A8A' },
  { name: 'White', value: '#FFFFFF' }
])

const availableSizes = ref(['XXS', 'XS', 'S', 'M', 'L', 'XL'])

// Computed properties
const productImages = computed(() => {
  if (!product.value) return []
  
  // In a real app, you'd have multiple images from the product data
  // For now, we'll simulate multiple views of the same product
  const baseImage = product.value.imageUrl
  return [
    baseImage,
    baseImage, // In real app, these would be different angles
    baseImage,
    baseImage
  ]
})

const finalPrice = computed(() => {
  if (!product.value) return 0
  const discount = (product.value.discountPercentage || 0) / 100
  return product.value.price * (1 - discount)
})

// Methods
const handleMenuToggle = (isOpen) => {
  isMenuOpen.value = isOpen
}

const fetchProduct = async () => {
  loading.value = true
  try {
    const productId = route.params.id
    const response = await api.get(`/product/${productId}`)
    product.value = response.data
    
    // Set default selections
    selectedImage.value = product.value.imageUrl
    if (availableColors.value.length > 0) {
      selectedColor.value = availableColors.value[0].name
    }
    if (availableSizes.value.length > 0) {
      selectedSize.value = 'S' // Default to S
    }
    
    console.log('Product loaded:', product.value)
  } catch (error) {
    console.error('Error fetching product:', error)
    popupRef.value?.show('Failed to load product details.', 'error')
    
    if (error.response?.status === 404) {
      // Product not found, product.value remains null
      popupRef.value?.show('Product not found. Please contact Administrator.', 'error')
    } else if (error.response?.status === 401) {
      popupRef.value?.show('Unauthorized. Redirecting to login.', 'error')
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}

const selectImage = (image) => {
  selectedImage.value = image
}

const selectColor = (color) => {
  selectedColor.value = color
}

const selectSize = (size) => {
  selectedSize.value = size
}

const increaseQuantity = () => {
  if (quantity.value < 99) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const updateCartTotalQuantity = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || []
    cartTotalQuantity.value = cart
      .filter((item) => item.userId === userId.value)
      .reduce((total, item) => total + item.quantity, 0)
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    cartTotalQuantity.value = 0
  }
}

const addToCart = () => {
  if (!product.value) return

  // Validate selections
  if (availableColors.value.length > 0 && !selectedColor.value) {
    popupRef.value?.show('Please select a color.', 'error')
    return
  }
  
  if (availableSizes.value.length > 0 && !selectedSize.value) {
    popupRef.value?.show('Please select a size.', 'error')
    return
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || []
  
  // Create a unique identifier including color and size
  const cartItemId = `${product.value.id}-${selectedColor.value}-${selectedSize.value}`
  
  const existing = cart.find((item) => 
    item.cartItemId === cartItemId && item.userId === userId.value
  )

  if (existing) {
    existing.quantity += quantity.value
  } else {
    cart.push({
      id: product.value.id,
      cartItemId: cartItemId,
      name: product.value.name,
      price: finalPrice.value,
      discountPercentage: product.value.discountPercentage,
      storeId: product.value.storeId,
      storeName: product.value.storeName,
      imageUrl: product.value.imageUrl,
      quantity: quantity.value,
      userId: userId.value,
      selectedColor: selectedColor.value,
      selectedSize: selectedSize.value,
    })
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart))

  // Update cart total quantity
  updateCartTotalQuantity()

  // Show success message
  const colorText = selectedColor.value ? ` (${selectedColor.value}` : ''
  const sizeText = selectedSize.value ? `${colorText ? ', ' : ' ('}${selectedSize.value}` : ''
  const variantText = colorText || sizeText ? `${colorText}${sizeText})` : ''
  
  popupRef.value?.show(
    `${quantity.value} ${product.value.name}${variantText} added to cart`, 
    'success'
  )

  // Reset quantity
  quantity.value = 1
}

const navigateToCart = () => {
  router.push('/cart')
}

const goBack = () => {
  router.go(-1) // Go back to previous page
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
}

// Initialize
onMounted(async () => {
  await fetchUserId()
  updateCartTotalQuantity()
  await fetchProduct()
})
</script>

<style scoped>
.prose {
  max-width: none;
}
</style>