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
        <button
          @click="navigateToProfile" 
          class="text-4xl text-white hover:text-gray-200 transition-colors"
        >
          <img v-if="userImage" :src="userImage" alt="User Profile" class="w-8 h-8 rounded-full" />
          <i v-else>👤</i>
        </button>
      </div>
    </div>

    <!-- Main Content with transition effect -->
    <div 
      class="flex flex-col w-full transition-all duration-500 ease-in-out"
      :class="{ 'translate-x-64': isMenuOpen }"
    >
      <!-- Top: Swiper Section -->
      <div v-if="slides.length > 0" class="w-full max-h-[350px] my-[50px] flex justify-center">
        <Swiper
          :modules="[Autoplay, Pagination]"
          :autoplay="{ delay: 5000, disableOnInteraction: false }"
          :pagination="{ clickable: true }"
          loop="true"
          class="w-full max-w-[1000px] rounded-lg overflow-hidden"
        >
          <SwiperSlide v-for="(slide, index) in slides" :key="slide.eventId">
            <div 
              class="w-full cursor-pointer relative group"
              @click="handleSlideClick(slide.eventId, slide.eventName)"
            >
              <img 
                :src="slide.imageUrl" 
                :alt="slide.altText" 
                class="w-full h-auto rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError($event, slide)"
              />
              <!-- Event overlay -->
              <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div class="text-white text-center">
                  <h3 class="text-2xl font-bold mb-2">{{ slide.eventName }}</h3>
                  <p class="text-sm">{{ slide.description || 'Click to see event products' }}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <!-- <SwiperSlide v-for="(slide, index) in slides" :key="index">
            <div class="w-full">
              <img :src="slide.imageUrl" :alt="slide.altText" class="w-full h-auto rounded-lg object-cover" />
            </div>
          </SwiperSlide> -->
        </Swiper>
      </div>

      <!-- No Events Message -->
      <div v-else-if="!loading" class="w-full max-h-[350px] my-[50px] flex justify-center">
        <div class="w-full max-w-[1000px] bg-gray-100 rounded-lg p-8 text-center">
          <p class="text-gray-500 text-lg">No active events at the moment</p>
        </div>
      </div>

      <!-- Event Filter Indicator -->
      <div v-if="selectedEventId" class="w-full px-4 mb-4">
        <div class="bg-blue-100 border border-blue-300 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-blue-800 font-medium">
              Showing products for: {{ events.find(e => e.id === selectedEventId)?.name }}
            </span>
          </div>
          <button 
            @click="clearEventFilter"
            class="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Clear Event Filter
          </button>
        </div>
      </div>


      <!-- Product Content -->
      <div class="flex flex-row gap-5 px-4">
        <!-- Left Side: Filter Section -->
        <div class="sticky top-0 max-h-[calc(100vh-1rem)] overflow-y-auto w-[200px] shrink-0 bg-white rounded-lg shadow-sm p-4">
          <!-- Filter section content -->
          <!-- Search Box -->
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">Search</h3>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search products..."
              @input="debounceSearch"
              class="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Category Filter -->
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">Category</h3>
            <div v-for="category in paginatedCategories" :key="category.id" class="flex items-center mb-2">
              <input
                type="checkbox"
                :id="'category-' + category.id"
                :value="category.id"
                v-model="selectedCategories"
                @change="applyFilters"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label :for="'category-' + category.id" class="ml-2 text-sm text-gray-700">{{ category.name }}</label>
            </div>
            <div v-if="categoriesPage < totalCategoriesPages" class="mt-1">
              <button
                @click="loadMoreCategories"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                See More
              </button>
            </div>
          </div>

          <!-- Brand (SubCategory) Filter -->
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">Brand</h3>
            <div
              v-for="subCategory in paginatedSubCategories"
              :key="subCategory.id"
              class="flex items-center mb-2"
            >
              <input
                type="checkbox"
                :id="'subCategory-' + subCategory.id"
                :value="subCategory.id"
                v-model="selectedBrands"
                @change="applyFilters"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label :for="'subCategory-' + subCategory.id" class="ml-2 text-sm text-gray-700">{{ subCategory.name }}</label>
            </div>
            <div v-if="subCategoriesPage < totalSubCategoriesPages" class="mt-1">
              <button
                @click="loadMoreSubCategories"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                See More
              </button>
            </div>
          </div>

          <!-- Price Range Filter -->
          <div>
            <h3 class="text-lg font-medium mb-2">Price Range</h3>
            <div v-for="range in priceRanges" :key="range.label" class="flex items-center mb-2">
              <input
                type="radio"
                name="priceRange"
                :id="range.label"
                :value="range"
                v-model="selectedPriceRange"
                @change="applyFilters"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <label :for="range.label" class="ml-2 text-sm text-gray-700">{{ range.label }}</label>
            </div>
          </div>
        </div>

        <!-- Right Side: Product List and Pagination -->
        <div class="flex-1">
          <!-- Loading indicator -->
          <div v-if="loading" class="flex justify-center my-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          
          <!-- No products found message -->
          <div v-if="!loading && products.length === 0" class="text-center py-8">
            <p class="text-gray-500 text-lg">No products found matching your criteria</p>
          </div>
          
          <!-- Product Grid -->
          <div v-if="!loading && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            <div 
              v-for="product in products" 
              :key="product.id" 
              class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
            >
              <!-- Product Image (Bigger) -->
              <div class="w-full h-96 overflow-hidden cursor-pointer"
                @click="navigateToProductDetail(product.id)"
              >
                <img 
                  :src="product.imageUrl" 
                  :alt="product.name" 
                  class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              
              <!-- Product Info -->
              <div class="p-4 flex flex-col h-full">
                <!-- Product Info and Price in split layout -->
                <div class="flex justify-between">
                  <!-- Left: Product Info (Clickable for detail view) -->
                  <div 
                    class="flex-1 pr-2 cursor-pointer"
                    @click="navigateToProductDetail(product.id)"
                  >
                    <h4 class="text-lg font-medium text-gray-800 mb-1 hover:text-blue-600 transition-colors">
                      {{ product.name }}
                    </h4>
                    <p class="text-xs text-gray-500 mb-1">Store: {{ product.storeName }}</p>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ product.description }}</p>
                  </div>
                  
                  <!-- Right: Price & Discount -->
                  <div class="flex flex-col items-end ml-2">
                    <p class="text-lg font-bold text-gray-800">
                      ${{ product.price - ((product.discountPercentage || 0) / 100) * product.price }}
                    </p>
                    <span 
                      v-if="product.discountPercentage" 
                      class="text-xs font-medium text-red-500"
                    >-{{ product.discountPercentage }}%</span>
                  </div>
                </div>

                <!-- Quick Actions Row -->
                <div class="flex items-center justify-between mt-4 mb-2">
                  <!-- View Details Button -->
                  <button 
                    @click="navigateToProductDetail(product.id)"
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View Details
                  </button>
                
                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-1">
                    <button 
                      @click="decreaseQuantity(product)"
                      class="w-6 h-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-sm"
                    >-</button>
                    <input 
                      type="number" 
                      v-model="quantities[product.id]" 
                      min="0"
                      class="w-10 h-6 text-center border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                      @click="increaseQuantity(product)"
                      class="w-6 h-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-sm"
                    >+</button>
                  </div>
                </div>
                
                <!-- Add to Cart Button with hover effect -->
                <div class="mt-auto pt-2">
                  <button 
                    @click="addToCart(product)" 
                    class="w-full py-2 rounded-md text-white text-sm font-medium transition-all duration-300 relative overflow-hidden add-to-cart-btn"
                  >
                    <span class="relative z-10">Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="!loading && totalItems > 0" class="flex justify-center my-8">
            <PaginationOption
              :currentPage="currentPage"
              :itemsPerPage="itemsPerPage"
              :totalItems="totalItems"
              :itemsPerPageOptions="[10, 20, 50, 100]"
              @update:currentPage="changePage"
              @update:itemsPerPage="changePageSize"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

// Import Swiper modules and styles
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'
import { Autoplay, Pagination } from 'swiper/modules'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'
import PaginationOption from '@/components/PaginationOption.vue'

// Data
// State to track if the menu is open
const isMenuOpen = ref(false)
// Handle menu toggle event from HamburgerMenu component
const handleMenuToggle = (isOpen) => {
  isMenuOpen.value = isOpen
}

// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

// State for products, filters, and Swiper slides
const products = ref([])
const categories = ref([])
const subCategories = ref([])
const priceRanges = ref([
  { label: 'All', min: 0, max: Infinity },
  { label: '$1 - $10', min: 1, max: 10 },
  { label: '$11 - $50', min: 11, max: 50 },
  { label: '$51 - $100', min: 51, max: 100 },
  { label: '$101+', min: 101, max: Infinity },
])

// Pagination state
const itemsPerPage = ref(10)
const currentPage = ref(1)
const totalPages = ref(0)
const totalItems = ref(0)
const categoriesPage = ref(1)
const subCategoriesPage = ref(1)
const itemsPerFilterPage = 10

// Swiper slides data
const slides = ref([])
const events = ref([])
// const slides = ref([
//   {
//     imageUrl:
//       'https://images.vexels.com/content/194698/preview/shop-online-slider-template-4f2c60.png',
//     altText: 'Slide 1',
//   },
//   {
//     imageUrl: 'https://i.pinimg.com/736x/b6/89/96/b68996b0aeb13339740f961ada455a77.jpg',
//     altText: 'Slide 2',
//   },
//   { imageUrl: 'https://pixosoft.com/images/sliders/pixosoft-slider-3.jpg', altText: 'Slide 3' },
// ])

// Header
const userImage = ref(null) // Placeholder for user image

// Filter State
const searchQuery = ref('')
const searchTimeout = ref(null)
const selectedCategories = ref([])
const selectedBrands = ref([])
const selectedPriceRange = ref(priceRanges.value[0]) // Default to "All"

// Quantity State
const quantities = ref({})
const cartTotalQuantity = ref(0)

// Vue Router for redirection
const router = useRouter()
const popupRef = ref(null)
const loading = ref(false)
const durationWait = 1000 // 1 second

// Debounce search to prevent excessive API calls
const debounceSearch = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1 // Reset to first page on new search
    fetchProducts()
  }, 500)
}

// Method to fetch products with server-side pagination and filtering
const fetchProducts = async () => {
  loading.value = true
  try {
    // Build query parameters
    const params = new URLSearchParams()
    params.append('pageNumber', currentPage.value)
    params.append('pageSize', itemsPerPage.value)
    
    // Add search query if present
    if (searchQuery.value) {
      params.append('searchQuery', searchQuery.value)
    }
    
    // Add category filters if selected
    if (selectedCategories.value.length > 0) {
      params.append('categoryIds', selectedCategories.value.join(','))
    }
    
    // Add subcategory filters if selected
    if (selectedBrands.value.length > 0) {
      params.append('subCategoryIds', selectedBrands.value.join(','))
    }
    
    // Add price range filter if selected
    if (selectedPriceRange.value && selectedPriceRange.value.label !== 'All') {
      params.append('minPrice', selectedPriceRange.value.min)
      params.append('maxPrice', selectedPriceRange.value.max)
    }
    
    // Add eventId parameter if an event is selected
    if (selectedEventId.value) {
      params.append('eventId', selectedEventId.value.toString())
    }

    // Make API request with query parameters
    const response = await api.get(`/product?${params.toString()}`)
    console.log('Fetched products:', response.data)
    
    // Update products and pagination data
    products.value = response.data.products
    totalItems.value = response.data.totalCount
    totalPages.value = response.data.totalPages
    
    // Initialize quantities for each product
    products.value.forEach((product) => {
      if (!quantities.value[product.id]) {
        quantities.value[product.id] = 0
      }
    })
    console.log('Quantities initialized:', quantities.value)
  } catch (error) {
    console.error('Error fetching products:', error)
    popupRef.value.show('Failed to fetch products. Please try again.', 'error')
    if (error.response?.status === 401) {
      popupRef.value.show('Unauthorized. Redirecting to login...', 'error')
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}

// Add this method to handle broken images
const handleImageError = (event, slide) => {
  console.warn(`Failed to load image for event: ${slide.eventName}`)
  // Set a fallback image
  event.target.src = 'https://images.vexels.com/content/194698/preview/shop-online-slider-template-4f2c60.png' // Add a default image
}

// Add these reactive variables after existing refs
const selectedEventId = ref(null)

// Add method to handle slide click
const handleSlideClick = (eventId, eventName) => {
  selectedEventId.value = eventId
  console.log(`Loading products for event: ${eventName} (ID: ${eventId})`)
  
  // Reset other filters when selecting an event for better UX
  selectedCategories.value = []
  selectedBrands.value = []
  selectedPriceRange.value = priceRanges.value[0] // Reset to "All"
  searchQuery.value = ''
  currentPage.value = 1
  
  // Load products for the selected event
  fetchProducts()
}

// Add method to clear event filter
const clearEventFilter = () => {
  selectedEventId.value = null
  currentPage.value = 1
  fetchProducts()
}

// Add method to load events
const fetchEvents = async () => {
  try {
    const response = await api.get('/event/active') // Get only active events for slides
    events.value = response.data
    slides.value = response.data.map(event => ({
      imageUrl: event.imageUrl,
      altText: event.name,
      eventId: event.id,
      eventName: event.name,
      description: event.description
    }))
  } catch (error) {
    console.error('Error loading events:', error)
    // Fallback to empty array if events fail to load
    slides.value = []
  }
}

// Fetch categories and subcategories 
const fetchCategoriesAndSubcategories = async () => {
  try {
    // Fetch Categories
    const categoryResponse = await api.get('/category')
    categories.value = categoryResponse.data

    // Fetch SubCategories
    const subCategoryResponse = await api.get('/subcategory')
    subCategories.value = subCategoryResponse.data
  } catch (error) {
    console.error('Error fetching categories/subcategories:', error)
    popupRef.value.show('Failed to fetch filters. Please try again.', 'error')
  }
}

// Apply Filters
const applyFilters = () => {
  currentPage.value = 1 // Reset to first page when filters change
  fetchProducts()
}

// Pagination controls
// Function to change page
const changePage = (page) => {
  currentPage.value = page
  fetchProducts()
  // Scroll to top of products
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Function to change page size
const changePageSize = (size) => {
  itemsPerPage.value = size
  currentPage.value = 1 // Reset to first page when page size changes
  fetchProducts()
}

// BUTTON QTY: Methods to Handle Quantity Changes
const increaseQuantity = (product) => {
  quantities.value[product.id]++
}

const decreaseQuantity = (product) => {
  if (quantities.value[product.id] > 0) {
    quantities.value[product.id]--
  }
}

// CART: Update cart total quantity
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

// Add to Cart
const addToCart = (product) => {
  const qty = quantities.value[product.id]
  if (!qty || qty <= 0) {
    popupRef.value.show('Please enter a valid quantity.', 'error')
    return
  }
  
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  const existing = cart.find((item) => item.id === product.id && item.userId === userId.value)

  if (existing) {
    existing.quantity += qty
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price - (product.discountPercentage / 100) * product.price,
      discountPercentage: product.discountPercentage,
      storeId: product.storeId,
      storeName: product.storeName,
      imageUrl: product.imageUrl,
      quantity: qty,
      userId: userId.value,
    })
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart))

  // Update cart total quantity
  updateCartTotalQuantity()

  // Show success message
  popupRef.value.show(`${qty} ${product.name} added to cart`, 'success')

  // Reset quantity for the product
  quantities.value[product.id] = 0
}

// Navigate to Cart Page
const navigateToCart = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/cart')
    loading.value = false
  }, durationWait)
}

// Navigate to Product Detail Page
const navigateToProductDetail = (productId) => {
  loading.value = true
  setTimeout(() => {
    router.push(`/product/${productId}`)
    loading.value = false
  }, durationWait)
}

// Navigate to User Profile Page
const navigateToProfile = () => {
  loading.value = true
  setTimeout(() => {
    router.push('/userprofile')
    loading.value = false
  }, durationWait)
}

// Computed properties for paginated filter data
const paginatedCategories = computed(() => {
  return categories.value.slice(0, categoriesPage.value * itemsPerFilterPage)
})

const paginatedSubCategories = computed(() => {
  return subCategories.value.slice(0, subCategoriesPage.value * itemsPerFilterPage)
})

// Total pages for categories, subcategories
const totalCategoriesPages = computed(() => Math.ceil(categories.value.length / itemsPerFilterPage))
const totalSubCategoriesPages = computed(() => Math.ceil(subCategories.value.length / itemsPerFilterPage))

// Load more categories/subcategories
const loadMoreCategories = () => {
  categoriesPage.value++
}

const loadMoreSubCategories = () => {
  subCategoriesPage.value++
}

// Watch for changes in filters and pagination
watch(
  [() => selectedCategories.value, () => selectedBrands.value, () => selectedPriceRange.value],
  () => {
    applyFilters()
  }
)

// Initialize data on component mount
onMounted(async () => {
  await fetchEvents() // Load events first

  await fetchUserId() // Fetch user ID
  updateCartTotalQuantity() // Initialize cart
  
  // Load categories and subcategories
  await fetchCategoriesAndSubcategories()
  
  // Initial product fetch
  await fetchProducts()
})
</script>

<style scoped>
/* Custom styles for the Add to Cart button with left-to-right transition */
.add-to-cart-btn {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
}

.add-to-cart-btn:hover {
  background: linear-gradient(45deg, #2563eb, #7c3aed);
}

.add-to-cart-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #10b981;
  width: 0%;
  transition: width 0.3s ease;
  z-index: 0;
}

.add-to-cart-btn:hover::before {
  width: 100%;
}
</style>