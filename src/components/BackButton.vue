<template>
  <LoadingOverlay :show="loading" />
  <div class="flex justify-between items-center px-4 py-4 bg-transparent text-white shadow backdrop-blur-md">
    <button
      @click="handleGoBack"
      class="flex items-center gap-2 font-medium text-black hover:bg-gradient-to-r from-gray-300/50 to-gray-500/50 px-4 py-2 rounded-md transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0L2.293 10l6-6a1 1 0 011.414 1.414L4.414 10l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
      </svg>
      {{ buttonLabel }}
    </button>
    <slot name="title">
      <h1 class="text-2xl font-bold text-black">{{ defaultTitle }}</h1>
    </slot>
    <div class="w-24"></div> <!-- Empty div for flex spacing -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingOverlay from './LoadingOverlay.vue'

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