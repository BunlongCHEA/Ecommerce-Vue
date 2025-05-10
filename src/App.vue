<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="flex justify-center items-center min-h-screen min-w-screen bg-gradient-to-b from-blue-500 via-white to-purple-600">
    <RouterView />
  </div>
  <!-- <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1> -->
</template>

<style scoped>
/* Global styles for the app */
/* body,
html {
  margin: 0;
  font-family: Arial, sans-serif;
  padding: 0;
  height: 100%;
  overflow-y: scroll;
  overflow-x: scroll;
} */

/* #app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 100vh;
  background: linear-gradient(to bottom, #0a83ed, #ffffff 50%, #640ce9);
} */
</style>
