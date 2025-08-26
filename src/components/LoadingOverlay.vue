<!-- components/LoadingOverlay.vue -->
<template>
  <div class="overlay" v-if="show">
    <!-- src="https://assets10.lottiefiles.com/packages/lf20_j1adxtyb.json" -->
    <!-- <lottie-player
      src="https://assets10.lottiefiles.com/packages/lf20_j1adxtyb.json"
      background="transparent"
      speed="1"
      loop
      autoplay
    ></lottie-player> -->
    <Vue3Lottie
      v-if="animationData"
      :animation-data="animationData"
      :background="transparent"
      :speed="1"
      :loop="true"
      :autoplay="true"
    />
  </div>
</template>

<script setup>
import { Vue3Lottie } from 'vue3-lottie'
import { onMounted, ref } from 'vue'

defineProps({
  show: Boolean,
})

// Reference data
const animationData = ref(null)

// onMounted to load animation
onMounted(async () => {
  try {
    const response = await fetch('/animation-loading.json')
    if (response.ok) {
      animationData.value = await response.json()
      console.log('✅ Animation data /animation-loading.json loaded successfully!')
    } else {
      console.error('Failed to load loading animation')
    }
  } catch (error) {
    console.error('Error loading loading animation:', error)
  }
})
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
