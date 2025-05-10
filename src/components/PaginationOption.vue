<template>
  <div class="pagination-container">
    <div class="pagination-controls">
      <div class="pagination-buttons">
        <button
          :disabled="currentPage === 1"
          @click="$emit('update:currentPage', currentPage - 1)"
          class="pagination-button"
        >
          Previous
        </button>

        <div class="pagination-select">
          <!-- <label for="itemsPerPage" class="pagination-label">Items per page:</label> -->
          <select
            :value="itemsPerPage"
            @change="$emit('update:itemsPerPage', +$event.target.value)"
            class="pagination-dropdown"
          >
            <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <button
          :disabled="currentPage === totalPages"
          @click="$emit('update:currentPage', currentPage + 1)"
          class="pagination-button"
        >
          Next
        </button>
      </div>
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
    default: () => [10, 20, 50],
  },
})

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
</script>

<style scoped>
.pagination-container {
  width: 100%;
  margin-top: 10px;
  padding: 1.5rem 1rem 1rem;
  /* border-top: 1px solid #e0e0e0; */
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
}

.pagination-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}

.pagination-dropdown {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.4rem 0.8rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-button:disabled {
  background-color: #d0d0d0;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #0056b3;
}
</style>
