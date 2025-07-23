<template>
  <div>
    <!-- Hamburger Button -->
    <button
      class="fixed top-4 left-4 z-50 text-4xl text-black hover:text-gray-300 transition-colors duration-300"
      @click="toggleHamburger"
    >
      <font-awesome-icon
        :icon="isMenuOpen ? 'fas fa-times' : 'fas fa-bars'"
        class="transition-transform duration-500"
        :class="isMenuOpen ? 'rotate-180 scale-90' : 'rotate-0 scale-100'"
      />
    </button>

    <!-- Backdrop -->
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-30"
      @click="toggleHamburger"
    ></div>

    <!-- Sidebar Navigation -->
    <div
      class="fixed top-0 left-0 z-40 h-full w-64 bg-gray-800 text-white flex flex-col shadow-md transform transition-transform duration-500"
      :class="isMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <nav class="flex-1 mt-16">
        <ul class="space-y-2">
          <li
            v-for="item in filteredRoutes"
            :key="item.name"
            class="group"
          >
            <router-link
              :to="item.path"
              class="flex items-center gap-4 px-4 py-3 transition-all duration-300 hover:bg-gray-700 hover:shadow-lg"
              @click="toggleHamburger"
            >
              <!-- Icon -->
              <div class="w-8 flex items-center justify-center">
                <font-awesome-icon :icon="item.icon" class="text-lg" />
              </div>
              <!-- Text (left-aligned) -->
              <span class="flex-1 text-base font-medium text-left">{{ item.name }}</span>
            </router-link>
          </li>

          <!-- Logout Button -->
          <li class="group">
            <button
              class="flex items-center gap-4 w-full px-4 py-3 transition-all duration-300 hover:bg-gray-700 hover:shadow-lg"
              @click="logout"
            >
              <!-- Icon -->
              <div class="w-8 flex items-center justify-center">
                <font-awesome-icon icon="fas fa-sign-out-alt" class="text-lg" />
              </div>
              <!-- Text (left-aligned) -->
              <span class="flex-1 text-base font-medium text-left">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFetchUserId } from '@/composables/useFetchUserId.js'
import { handleLogout } from '@/services/api.js'

// State to track menu open/close
const isMenuOpen = ref(false)

// Define emits
const emit = defineEmits(['menu-toggle'])

// Toggle the hamburger menu
const toggleHamburger = () => {
  isMenuOpen.value = !isMenuOpen.value
  emit('menu-toggle', isMenuOpen.value)
}

// Watch for changes to isMenuOpen
watch(isMenuOpen, (newValue) => {
  emit('menu-toggle', newValue)
})

// Define routes with icons
const routes = [
  { name: 'Product Shopping', path: '/product', icon: 'fas fa-box' },
  { name: 'Add To Cart', path: '/cart', icon: 'fas fa-shopping-cart' },
  { name: 'Manage Payment', path: '/payment', icon: 'fas fa-credit-card' },
  { name: 'Manage Location', path: '/location', icon: 'fas fa-map-marker-alt' },
  { name: 'Manage Coupon', path: '/coupon', icon: 'fas fa-ticket-alt' },
  { name: 'View Order', path: '/order', icon: 'fas fa-receipt' },
  { name: 'Admin Order Detail', path: '/admin/orderdetail', icon: 'fas fa-cogs', adminOnly: true },
  { name: 'Admin Product', path: '/admin/product', icon: 'fas fa-cogs', adminOnly: true },
  // { name: 'Logout', path: '/', icon: 'fas fa-sign-out-alt' },
]

// Fetch user info
const { userId, role, fetchUserId } = useFetchUserId()

// Filter routes based on user role
const filteredRoutes = computed(() => {
  console.log('User Role Hamburger:', role.value)
  console.log('User ID Hamburger:', userId.value)
  return routes.filter(route => (route.adminOnly ? role.value === 'Admin' : true))
})

// Logout function
const router = useRouter() // Access the router instance
const logout = () => {
  console.log('Logging out & removed token, localStorage, and cookies')
  handleLogout() // Call the logout handler from `api.js`
  
  localStorage.removeItem('userId')
  console.log('User ID:', userId.value)
  console.log('Role:', role.value)
  console.log('AuthToken:', localStorage.getItem('authToken'))
  console.log('Document Cookies:', document.cookie)
  
  router.push('/') // Redirect to the login page
}

// Fetch user data on component mount
fetchUserId()
</script>

<style scoped>
/* Styling for the sidebar and hover effects */
.group:hover > .block {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
}

/* Transition effect for icon animation */
button .fa-bars,
button .fa-times {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

/* Smooth slide-in and slide-out animation for the sidebar */
.sidebar {
  transition: transform 0.5s ease-in-out;
}
</style>