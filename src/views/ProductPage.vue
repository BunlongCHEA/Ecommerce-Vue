<template>
  <div class="flex flex-col w-full min-h-screen bg-gray-50">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Header Section -->
    <div class="flex justify-between items-center w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600">
      <!-- Left: Hamburger Menu -->
      <button class="text-4xl text-white hover:text-gray-200 transition-colors" @click="toggleHamburger">☰</button>

      <!-- Right: Cart and User Profile -->
      <div class="flex items-center gap-5">
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

    <!-- Top: Swiper Section -->
    <div class="w-full max-h-[350px] my-[50px] flex justify-center">
      <Swiper
        :modules="[Autoplay, Pagination]"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        loop="true"
        class="w-full max-w-[1000px] rounded-lg overflow-hidden"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index">
          <div class="w-full">
            <img :src="slide.imageUrl" :alt="slide.altText" class="w-full h-auto rounded-lg object-cover" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Main Content -->
    <div class="flex flex-row gap-5 px-4">
      <!-- Left Side: Filter Section -->
      <div class="sticky top-0 max-h-[calc(100vh-1rem)] overflow-y-auto w-[200px] shrink-0 bg-white rounded-lg shadow-sm p-4">
        <!-- Search Box -->
        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2">Search</h3>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
            @input="applyFilters"
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
        <!-- Product Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <div 
            v-for="product in paginatedProducts" 
            :key="product.id" 
            class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
          >
            <!-- Product Image (Bigger) -->
            <div class="w-full h-96 overflow-hidden">
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
                <!-- Left: Product Info -->
                <div class="flex-1 pr-2">
                  <h4 class="text-lg font-medium text-gray-800 mb-1">{{ product.name }}</h4>
                  <p class="text-xs text-gray-500 mb-1">Store: {{ product.storeName }}</p>
                  <p class="text-sm text-gray-600 line-clamp-2">{{ product.description }}</p>
                </div>
                
                <!-- Right: Price & Discount -->
                <div class="flex flex-col items-end ml-2">
                  <p class="text-lg font-bold text-gray-800">
                    ${{ product.price - ((product.discountAmount || 0) / 100) * product.price }}
                  </p>
                  <span 
                    v-if="product.discountAmount" 
                    class="text-xs font-medium text-red-500"
                  >-{{ product.discountAmount }}%</span>
                </div>
              </div>
              
              <!-- Quantity Controls -->
              <div class="flex items-center justify-center gap-2 mt-4 mb-2">
                <button 
                  @click="decreaseQuantity(product)"
                  class="w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                >-</button>
                <input 
                  type="number" 
                  v-model="quantities[product.id]" 
                  min="0"
                  class="w-12 h-8 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  @click="increaseQuantity(product)"
                  class="w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                >+</button>
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
        <div class="flex justify-center mt-8 mb-8">
          <PaginationOption
            :currentPage="currentPage"
            :itemsPerPage="itemsPerPage"
            :totalItems="filteredProducts.length"
            :itemsPerPageOptions="[10, 20, 50]"
            @update:currentPage="currentPage = $event"
            @update:itemsPerPage="
              (val) => {
                itemsPerPage = val
                resetPagination()
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

// Import Swiper modules and styles
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'
import { Autoplay, Pagination } from 'swiper/modules'

import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PaginationOption from '@/components/PaginationOption.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'
// import PaginationSeeMore from '@/components/PaginationSeeMore.vue'

// Data
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

// Swiper slides data
const slides = ref([
  {
    imageUrl:
      'https://images.vexels.com/content/194698/preview/shop-online-slider-template-4f2c60.png',
    altText: 'Slide 1',
  },
  {
    imageUrl: 'https://i.pinimg.com/736x/b6/89/96/b68996b0aeb13339740f961ada455a77.jpg',
    altText: 'Slide 2',
  },
  { imageUrl: 'https://pixosoft.com/images/sliders/pixosoft-slider-3.jpg', altText: 'Slide 3' },
])

// Header
const userImage = ref(null) // Placeholder for user image

// Filter State
const searchQuery = ref('')
const selectedCategories = ref([])
const selectedBrands = ref([])
const selectedPriceRange = ref(priceRanges.value[0]) // Default to "All"

// Quantity State
const quantities = ref({})
const cartTotalQuantity = ref(0);

// Vue Router for redirection
const router = useRouter()
const popupRef = ref(null)
const loading = ref(false)
const durationWait = 1000 // 1 second
// const userId = ref(null)

// Pagination state
const itemsPerPage = ref(10)
const currentPage = ref(1)
const categoriesPage = ref(1)
const subCategoriesPage = ref(1)
const itemsPerFilterPage = 10

// Method
// Fetch data from API
const fetchData = async () => {
  try {
    // Fetch Products
    const productResponse = await api.get('/product') // Token is included automatically
    products.value = productResponse.data.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      storeName: product.storeName,
      discountAmount: product.discountAmount,
      subCategoryId: product.subCategoryId,
      categoryId: product.categoryId,
    }))

    // Fetch Categories
    const categoryResponse = await api.get('/category') // Token is included automatically
    categories.value = categoryResponse.data

    // Fetch SubCategories
    const subCategoryResponse = await api.get('/subcategory') // Token is included automatically
    subCategories.value = subCategoryResponse.data

    // Initialize quantities for each product
    products.value.forEach((product) => {
      quantities.value[product.id] = 0
    })
  } catch (error) {
    // console.error('Error fetching data:', error)
    popupRef.value.show('Failed to fetch data. Please try again.', 'error')
    if (error.response?.status === 401) {
      popupRef.value.show('Unauthorized. Redirecting to login...', 'error')
      router.push('/')
    }
  }
}

// Computed Property for Filtered Products
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory =
      selectedCategories.value.length === 0 || selectedCategories.value.includes(product.categoryId)

    const matchesSubCategory =
      selectedBrands.value.length === 0 || selectedBrands.value.includes(product.subCategoryId)

    const matchesPriceRange =
      !selectedPriceRange.value ||
      (product.price >= selectedPriceRange.value.min &&
        product.price <= selectedPriceRange.value.max)

    return matchesSearchQuery && matchesCategory && matchesSubCategory && matchesPriceRange
  })
})
// Apply Filters (Trigger Recalculation)
const applyFilters = () => {
  // This method exists to trigger recalculation when filters change.
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

// CART: Computed Property for Total Quantity for Cart
const updateCartTotalQuantity = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartTotalQuantity.value = cart
      .filter((item) => item.userId === userId.value) // Filter items by userId  
      .reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    popupRef.value.show('Fail to Add Or Update to Cart', 'error')
    console.error('Error reading cart from localStorage:', error);
    cartTotalQuantity.value = 0;
  }
};


// BUTTON Add to Cart: when user input quantity and click add to cart
const addToCart = (product) => {
  const qty = quantities.value[product.id]
  if (!qty || qty <= 0) {
    popupRef.value.show('Please enter a valid quantity.', 'error')
    return
  }
  
  console.log('User ID:', userId.value)
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  const existing = cart.find((item) => item.id === product.id && item.userId === userId.value)

  if (existing) {
    existing.quantity += qty
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price - (product.discountAmount / 100) * product.price,
      discountAmount: product.discountAmount,
      storeName: product.storeName,
      imageUrl: product.imageUrl,
      quantity: qty,
      userId: userId.value,
    })
    console.log('cart', cart)
  }
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart))

  // Update cart total quantity
  updateCartTotalQuantity()

  // Show success message
  popupRef.value.show(`${quantities.value[product.id]} ${product.name} added to cart`, 'success') 
}

// BUTTON: Navigate to Cart Page
const navigateToCart = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/cart')
  }, durationWait)
}

// Hamburger Menu Toggle (Placeholder for future functionality)
const toggleHamburger = () => {
  // Placeholder for hamburger menu functionality
  console.log('Hamburger menu toggled')
}

// PAGINATION : Computed properties for paginated data
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})
const paginatedCategories = computed(() => {
  // const start = (categoriesPage.value - 1) * itemsPerFilterPage
  // const end = start + itemsPerFilterPage
  return categories.value.slice(0, categoriesPage.value * itemsPerFilterPage)
})
const paginatedSubCategories = computed(() => {
  // const start = (subCategoriesPage.value - 1) * itemsPerFilterPage
  // const end = start + itemsPerFilterPage
  return subCategories.value.slice(0, subCategoriesPage.value * itemsPerFilterPage)
})

// Methods for pagination controls
// const nextPage = () => {
//   if (currentPage.value < totalPages.value) currentPage.value++
// }
// const prevPage = () => {
//   if (currentPage.value > 1) currentPage.value--
// }
const resetPagination = () => {
  currentPage.value = 1
}

// Total pages for categories, subcategories, and products
// const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))
const totalCategoriesPages = computed(() => Math.ceil(categories.value.length / itemsPerFilterPage))
const totalSubCategoriesPages = computed(() =>
  Math.ceil(subCategories.value.length / itemsPerFilterPage),
)

const loadMoreCategories = () => {
  // if (categoriesPage.value < totalCategoriesPages) categoriesPage.value++
  categoriesPage.value++
}
const loadMoreSubCategories = () => {
  // if (subCategoriesPage.value < totalSubCategoriesPages) subCategoriesPage.value++
  subCategoriesPage.value++
}
// END PAGINATION

// Automatically fetch data when the page is loaded
onMounted(() => {
  fetchUserId() // Fetch user ID when the component is mounted
  fetchData()
  // Initialize cart quantity from localStorage
  updateCartTotalQuantity();
})
</script>

<style scoped>
/* Custom styles for the Add to Cart button with left-to-right transition */
.add-to-cart-btn {
  background-color: #6b7280; /* Gray base color */
}

.add-to-cart-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #10b981; /* Green color for hover */
  width: 0%;
  transition: width 0.3s ease;
  z-index: 0;
}

.add-to-cart-btn:hover::before {
  width: 100%;
}

/* Line clamp for product description */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>