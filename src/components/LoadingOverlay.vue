<!-- components/LoadingOverlay.vue -->
<template>
  <div class="overlay" v-if="show">
    <lottie-player
      src="https://assets10.lottiefiles.com/packages/lf20_j1adxtyb.json"
      background="transparent"
      speed="1"
      loop
      autoplay
    ></lottie-player>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
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
