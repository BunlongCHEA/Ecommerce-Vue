<template>
  <transition name="fade">
    <div v-if="visible" class="popup-message" :class="type">
      {{ messageText }}
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, defineExpose } from 'vue'

const visible = ref(false)
const messageText = ref('')
const type = ref('error') // 'success' | 'error'

const show = (msg, msgType = 'error', duration = 5000) => {
  messageText.value = msg
  type.value = msgType
  visible.value = true

  setTimeout(() => {
    visible.value = false
  }, duration)
}

// Expose function to parent
defineExpose({ show })
</script>

<style scoped>
.popup-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.popup-message.success {
  background-color: #28a745;
}
.popup-message.error {
  background-color: #dc3545;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* .popup-message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  color: white;
  background-color: #dc3545;
  text-align: center;
}
.popup-message.success {
  background-color: #28a745;
} */
</style>
