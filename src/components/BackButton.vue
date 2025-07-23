<template>
  <div class="relative">
    <!-- Loading Overlay -->
    <LoadingOverlay :show="loading" />

    <!-- Navigation Bar -->
    <div class="flex justify-between items-center px-4 py-4 bg-transparent text-black shadow backdrop-blur-md">
      <!-- Left Section: Back Button only (hamburger will be separate) -->
      <div class="flex items-center gap-10 ml-16"> <!-- Added margin-left to avoid overlapping with hamburger -->
        <!-- Hamburger menu removed from here as it's a separate component -->
        <button
          @click="handleGoBack"
          class="flex items-center gap-2 font-medium text-black hover:bg-gradient-to-r from-gray-300/50 to-gray-500/50 px-4 py-2 rounded-md transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0L2.293 10l6-6a1 1 0 011.414 1.414L4.414 10l5.293 5.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          {{ buttonLabel }}
        </button>
      </div>

      <!-- Center Section: Page Title -->
      <div class="absolute left-1 transform -translate-x-1/2">
        <slot name="title">
          <h1 class="text-2xl font-bold">{{ defaultTitle }}</h1>
        </slot>
      </div>

      <!-- Right Section: Empty for spacing -->
      <!-- <div class="w-24"></div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingOverlay from './LoadingOverlay.vue'
import HamburgerMenu from './HamburgerMenu.vue'

const props = defineProps({
  buttonLabel: {
    type: String,
    default: 'Back'
  },
  destination: {
    type: String,
    required: true
  },
  defaultTitle: {
    type: String,
    default: 'Page Title'
  },
  waitDuration: {
    type: Number,
    default: 1000 // Default wait time is 1 second
  }
})

const loading = ref(false)
const router = useRouter()

const handleGoBack = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.push(props.destination)
  }, props.waitDuration)
}
</script>

<style scoped>
/* Styling to ensure consistent UI */
.relative {
  position: relative;
}

.shadow {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
}

.transition {
  transition: all 0.3s ease-in-out;
}

.absolute {
  position: absolute;
}

.left-1 {
  left: 55%;
}

.transform {
  transform: translateX(-50%);
}
</style>