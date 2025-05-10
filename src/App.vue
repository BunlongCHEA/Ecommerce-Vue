<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <!-- Render the current route's component -->
    <RouterView />
  </div>
</template>

<style scoped>
/* Global styles for the app */
body,
html {
  margin: 0;
  font-family: Arial, sans-serif;
  padding: 0;
  height: 100%;
  overflow-y: scroll;
  overflow-x: scroll;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 100vh;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
}
</style>
