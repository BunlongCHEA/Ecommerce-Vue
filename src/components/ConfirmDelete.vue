<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 transition-opacity duration-300"
    :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
  >
    <div 
      class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4 transform transition-transform duration-300"
      :class="{ 'scale-95 opacity-0': !isVisible, 'scale-100 opacity-100': isVisible }"
    >
      <div class="flex items-center mb-4">
        <div class="bg-red-100 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </div>
      <p class="mb-6 text-gray-600">{{ message }}</p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancel"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
        >
          {{ cancelButtonText }}
        </button>
        <button 
          @click="confirm"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          :class="{ 'opacity-75 cursor-not-allowed': loading }"
          :disabled="loading"
        >
          <template v-if="loading">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </template>
          <template v-else>
            {{ confirmButtonText }}
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Deletion'
  },
  message: {
    type: String,
    default: 'Are you sure you want to delete this item? This action cannot be undone.'
  },
  confirmButtonText: {
    type: String,
    default: 'Delete'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  loading: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel', 'update:show']);

const isOpen = ref(false);
const isVisible = ref(false);

const open = () => {
  isOpen.value = true;
  // Small delay to allow the DOM to update before starting the animation
  setTimeout(() => {
    isVisible.value = true;
  }, 10);
};

const close = () => {
  isVisible.value = false;
  // Wait for the animation to finish before removing the component from the DOM
  setTimeout(() => {
    isOpen.value = false;
    emit('update:show', false);
  }, 300);
};

// Define functions before using them in watch
const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
  close();
};

// Now we can watch prop changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    open();
  } else {
    close();
  }
}, { immediate: true });

// Close on escape key press
const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    cancel();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>