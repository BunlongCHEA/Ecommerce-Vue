<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <div class="flex items-center justify-center flex-wrap gap-4">
      <!-- Page navigation -->
      <div class="flex items-center rounded-md bg-white shadow-sm">
        <!-- First page button -->
        <button 
          @click="$emit('update:currentPage', 1)" 
          :disabled="currentPage === 1"
          class="px-3 py-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          :class="{ 'text-gray-300 cursor-not-allowed': currentPage === 1 }"
          aria-label="Go to first page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 010 1.414zM15.707 4.293a1 1 0 00-1.414 0L10 8.586 5.707 4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l5-5a1 1 0 000-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Previous page button -->
        <button 
          @click="$emit('update:currentPage', currentPage - 1)" 
          :disabled="currentPage === 1"
          class="px-3 py-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors border-l border-r border-gray-200"
          :class="{ 'text-gray-300 cursor-not-allowed': currentPage === 1 }"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Page numbers -->
        <div class="flex items-center flex-wrap">
          <!-- If 10 or fewer total pages, show all pages -->
          <template v-if="totalPages <= 10">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="$emit('update:currentPage', page)"
              :class="[
                currentPage === page 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-blue-600',
                'px-3 py-2 transition-colors'
              ]"
            >
              {{ page }}
            </button>
          </template>
          
          <!-- If more than 10 pages, distribute with ellipses -->
          <template v-else>
            <!-- First set of pages (1-4) -->
            <template v-for="page in 4" :key="`start-${page}`">
              <button
                @click="$emit('update:currentPage', page)"
                :class="[
                  currentPage === page 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600',
                  'px-3 py-2 transition-colors'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <!-- Left ellipsis if needed -->
            <span 
              v-if="showLeftEllipsis" 
              class="px-3 py-2 text-gray-500"
            >
              ...
            </span>
            
            <!-- Middle pages around current page -->
            <template v-for="page in middlePages" :key="`middle-${page}`">
              <button
                @click="$emit('update:currentPage', page)"
                :class="[
                  currentPage === page 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600',
                  'px-3 py-2 transition-colors'
                ]"
              >
                {{ page }}
              </button>
            </template>
            
            <!-- Right ellipsis if needed -->
            <span 
              v-if="showRightEllipsis" 
              class="px-3 py-2 text-gray-500"
            >
              ...
            </span>
            
            <!-- Last set of pages (totalPages-3 to totalPages) -->
            <template v-for="offset in 4" :key="`end-${offset}`">
              <button
                @click="$emit('update:currentPage', totalPages - 4 + offset)"
                :class="[
                  currentPage === totalPages - 4 + offset
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600',
                  'px-3 py-2 transition-colors'
                ]"
              >
                {{ totalPages - 4 + offset }}
              </button>
            </template>
          </template>
        </div>

        <!-- Next page button -->
        <button 
          @click="$emit('update:currentPage', currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors border-l border-r border-gray-200"
          :class="{ 'text-gray-300 cursor-not-allowed': currentPage === totalPages }"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Last page button -->
        <button 
          @click="$emit('update:currentPage', totalPages)" 
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-gray-600 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          :class="{ 'text-gray-300 cursor-not-allowed': currentPage === totalPages }"
          aria-label="Go to last page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L10 11.414l4.293 4.293a1 1 0 001.414-1.414l-5-5a1 1 0 00-1.414 0l-5 5a1 1 0 000 1.414zM4.293 4.293a1 1 0 000 1.414L8.586 10l-4.293 4.293a1 1 0 101.414 1.414l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Items per page selector -->
      <div class="flex items-center gap-2">
        <label for="itemsPerPage" class="text-sm text-gray-700">Items per page:</label>
        <select
          id="itemsPerPage"
          :value="itemsPerPage"
          @change="$emit('update:itemsPerPage', +$event.target.value)"
          class="rounded-md border border-gray-300 text-gray-700 py-1 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Items counter -->
    <div class="text-sm text-gray-500">
      Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPageOptions: {
    type: Array,
    default: () => [10, 100, 200, 500],
  },
});

defineEmits(['update:currentPage', 'update:itemsPerPage']);

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage) || 1);

const startItem = computed(() => {
  return props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

// Middle pages - show pages around current page when not in start/end ranges
const middlePages = computed(() => {
  // If we have 10 or fewer pages, no middle pages needed
  if (totalPages.value <= 10) {
    return [];
  }
  
  // If current page is in the first 4 pages or last 4 pages, no middle pages
  if (props.currentPage <= 4 || props.currentPage > totalPages.value - 4) {
    return [];
  }
  
  // Calculate how many pages to show in the middle (try for 2)
  let startPage = Math.max(5, props.currentPage - 1);
  let endPage = Math.min(totalPages.value - 5, props.currentPage + 1);
  
  // Ensure we don't show duplicates from start/end sections
  if (startPage <= 4) startPage = 5;
  if (endPage >= totalPages.value - 3) endPage = totalPages.value - 5;
  
  // Only create middle array if there are pages to show
  if (startPage <= endPage) {
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  
  return [];
});

// Show left ellipsis when needed
const showLeftEllipsis = computed(() => {
  // No need for ellipsis with 10 or fewer pages
  if (totalPages.value <= 10) return false;
  
  // Show ellipsis if current page is beyond page 5
  return props.currentPage > 5;
});

// Show right ellipsis when needed
const showRightEllipsis = computed(() => {
  // No need for ellipsis with 10 or fewer pages
  if (totalPages.value <= 10) return false;
  
  // Show ellipsis if current page is before totalPages-4
  return props.currentPage < totalPages.value - 4;
});
</script>