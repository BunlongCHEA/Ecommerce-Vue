<template>
  <div class="product-page">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Header Section -->
    <div class="header">
      <!-- Left: Hamburger Menu -->
      <button class="hamburger-menu" @click="toggleHamburger">☰</button>

      <!-- Right: Cart and User Profile -->
      <div class="header-buttons">
        <!-- Cart Button -->
        <button class="cart-button" @click="navigateToCart">
          <i class="cart-icon">🛒</i>
          <span v-if="totalQuantity > 0" class="cart-quantity">{{ totalQuantity }}</span>
        </button>

        <!-- User Profile Button -->
        <button class="profile-button">
          <img v-if="userImage" :src="userImage" alt="User Profile" class="user-image" />
          <i v-else class="default-user-icon">👤</i>
        </button>
      </div>
    </div>

    <!-- Top: Swiper Section -->
    <div class="swiper-container">
      <Swiper
        :modules="[Autoplay, Pagination]"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        loop="true"
        class="mySwiper"
      >
        <SwiperSlide v-for="(slide, index) in slides" :key="index">
          <div class="swiper-slide-content">
            <img :src="slide.imageUrl" :alt="slide.altText" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Two-Column Layout -->
    <div class="main-content">
      <!-- Left Side: Filter Section -->
      <div class="filter-section">
        <!-- Search Box -->
        <div class="filter-box">
          <h3>Search</h3>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
            @input="applyFilters"
          />
        </div>

        <!-- Category Filter -->
        <div class="filter-box">
          <h3>Category</h3>
          <div v-for="category in paginatedCategories" :key="category.id" class="filter-item">
            <input
              type="checkbox"
              :id="'category-' + category.id"
              :value="category.id"
              v-model="selectedCategories"
              @change="applyFilters"
            />
            <label :for="'category-' + category.id">{{ category.name }}</label>
          </div>
          <div class="see-more-container">
            <button
              v-if="categoriesPage < totalCategoriesPages"
              @click="loadMoreCategories"
              class="see-more-button"
            >
              See More
            </button>
          </div>
        </div>

        <!-- Brand (SubCategory) Filter -->
        <div class="filter-box">
          <h3>Brand</h3>
          <div
            v-for="subCategory in paginatedSubCategories"
            :key="subCategory.id"
            class="filter-item"
          >
            <input
              type="checkbox"
              :id="'subCategory-' + subCategory.id"
              :value="subCategory.id"
              v-model="selectedBrands"
              @change="applyFilters"
            />
            <label :for="'subCategory-' + subCategory.id">{{ subCategory.name }}</label>
          </div>
          <div class="see-more-container">
            <button
              v-if="subCategoriesPage < totalSubCategoriesPages"
              @click="loadMoreSubCategories"
              class="see-more-button"
            >
              See More
            </button>
          </div>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-box">
          <h3>Price Range</h3>
          <div v-for="range in priceRanges" :key="range.label" class="filter-item">
            <input
              type="radio"
              name="priceRange"
              :id="range.label"
              :value="range"
              v-model="selectedPriceRange"
              @change="applyFilters"
            />
            <label :for="range.label">{{ range.label }}</label>
          </div>
        </div>
      </div>

      <!-- Right Side: Product List and Pagination -->
      <div class="product-section">
        <div class="product-list">
          <div v-for="product in paginatedProducts" :key="product.id" class="product-item">
            <img :src="product.imageUrl" :alt="product.name" />
            <h4>{{ product.name }}</h4>
            <p class="store-name">Store: {{ product.storeName }}</p>
            <p class="price">
              ${{ product.price - ((product.discountAmount || 0) / 100) * product.price }}
              <span v-if="product.discountAmount" class="discount"
                >(-{{ product.discountAmount }}%)</span
              >
            </p>
            <p class="description">{{ product.description }}</p>
            <div class="quantity-control">
              <button @click="decreaseQuantity(product)">-</button>
              <input type="number" v-model="quantities[product.id]" min="0" />
              <button @click="increaseQuantity(product)">+</button>
            </div>
            <div class="sticky-add-cart">
              <button @click="addToCart(product)" class="add-to-cart-button">Add to Cart</button>
            </div>
          </div>
        </div>

        <!-- Pagination Controls for Product List -->
        <!-- <div class="pagination-controls">
        <label for="itemsPerPage">Items per page:</label>
        <select id="itemsPerPage" v-model="itemsPerPage" @change="resetPagination">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <button :disabled="currentPage === 1" @click="prevPage">Previous</button>
        <button :disabled="currentPage === totalPages" @click="nextPage">Next</button>
      </div> -->

        <!-- Pagination Component -->
        <div class="product-pagination-wrapper">
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

        <!-- <div class="sticky-add-cart">
          <button @click="addToCart(product)" class="add-to-cart-button">Add to Cart</button>
        </div> -->
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
// import PaginationSeeMore from '@/components/PaginationSeeMore.vue'

// Data
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

// Vue Router for redirection
const router = useRouter()
const popupRef = ref(null)
const loading = ref(false)
const durationWait = 1000 // 1 second

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
// Automatically fetch data when the page is loaded
onMounted(() => {
  fetchData()
})

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
const totalQuantity = computed(() => {
  return Object.values(quantities.value).reduce((total, quantity) => total + quantity, 0)
})

// BUTTON Add to Cart: when user input quantity and click add to cart
const addToCart = (product) => {
  const qty = quantities.value[product.id]
  if (!qty || qty <= 0) {
    popupRef.value.show('Please enter a valid quantity.', 'error')
    return
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || []
  const existing = cart.find((item) => item.id === product.id)

  if (existing) {
    existing.quantity += qty
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      // price: product.price,
      price: product.price - (product.discountAmount / 100) * product.price,
      discountAmount: product.discountAmount,
      storeName: product.storeName,
      imageUrl: product.imageUrl,
      quantity: qty,
    })
  }

  localStorage.setItem('cart', JSON.stringify(cart))
  // quantities.value[product.id] = 0 // Reset quantity after adding to cart
  popupRef.value.show(`${quantities.value[product.id]} ${product.name} added to cart`, 'success') // Show success message
}

// BUTTON: Navigate to Cart Page
const navigateToCart = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push('/cart')
  }, durationWait)
}

// Apply Filters (Trigger Recalculation)
const applyFilters = () => {
  // This method exists to trigger recalculation when filters change.
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
</script>

<style scoped>
/* Main container for the page */
.product-page {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  padding: 10px;
  height: auto;
  width: 100%;
  box-sizing: border-box;
  /* overflow-x: auto; */
  flex-direction: column; /* Add column direction to include swiper */
}

/* Header Section */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
  /* background-color: white; */
  background: transparent;
  /* border-bottom: 1px solid #ddd; */
}

.hamburger-menu {
  font-size: 38px;
  border: none;
  background: none;
  cursor: pointer;
  color: white;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 38px;
}

.cart-quantity {
  position: absolute;
  top: -5px;
  right: -10px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}

.profile-button {
  background: none;
  border: none;
  cursor: pointer;
}

.user-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.default-user-icon {
  font-size: 38px;
}

/* Swiper Section */
.swiper-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-height: 350px;
  margin-bottom: 80px;
  margin-top: 50px;
}

.mySwiper {
  width: 100%;
  max-width: 1000px;
}

.mySwiper img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}

/* Main Content: Filter + Product List */
.main-content {
  display: flex;
  flex-direction: row;
  gap: 20px;
  /* Align the filter and product list to the top */
  align-items: flex-start;
}

/* Left Side: Filter Section */
.filter-section {
  position: sticky;
  top: 10px;
  flex: 0 0 100px;
  /* max-width: 100px; */
  width: 100%;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  box-sizing: border-box;
}

.filter-box {
  margin-bottom: 20px;
}

.filter-box h3 {
  margin-bottom: 10px;
  font-size: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-item label {
  margin-left: 8px;
  font-size: 14px;
}

/* Filter button - See More */
.see-more-container {
  margin-top: 0.5rem;
}

.see-more-button {
  padding: 0.4rem 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.see-more-button:hover {
  background-color: #0056b3;
}
/* END: filter button - See More */

/* Right Side: Product List */
.product-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.product-pagination-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* Fixed 5 columns */
  gap: 20px;
  flex-grow: 1;
  width: 100%;
  /* min-width: 1250px; */
  padding-bottom: 40px;
}

.product-item {
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.product-item img {
  max-width: 100%;
  height: auto;
  margin-bottom: 15px;
}

.product-item h4 {
  font-size: 18px;
  margin-bottom: 10px;
}

.product-item .store-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.product-item .price {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-item .price .discount {
  color: red;
  font-size: 14px;
  margin-left: 5px;
}

.product-item .description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.quantity-control button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
}

.quantity-control button:hover {
  background: #0056b3;
}

.quantity-control input {
  width: 50px;
  text-align: center;
}

/* BUTTON: Add to cart */
.sticky-add-cart {
  position: sticky;
  bottom: 0;
  background: transparent;
  padding-top: 10px;
}

.add-to-cart-button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

.add-to-cart-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
