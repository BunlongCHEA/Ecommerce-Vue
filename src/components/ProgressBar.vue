<template>
    <div class="relative flex items-center justify-between mt-4">
      <div
        v-for="(step, index) in steps"
        :key="step.name"
        class="flex flex-col items-center"
      >
        <span
          :class="[
            'text-sm mt-2',
            step.value === currentStatus || isStepCompleted(currentStatus, step.value) ? 'text-purple-600 font-medium' : 'text-gray-500'
          ]"
        >
          {{ step.name }}
        </span>
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center z-10',
            step.value === currentStatus || isStepCompleted(currentStatus, step.value) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
          ]"
        >
          <font-awesome-icon
            :icon="isStepCompleted(currentStatus, step.value) ? 'fas fa-check' : step.icon"
          />
        </div>
        <div
          v-if="index < steps.length - 1"
          :class="[
            'absolute top-5/7 left-4 transform -translate-y-1/2 h-1 z-0',
            step.value === currentStatus || isStepCompleted(currentStatus, step.value)
              ? 'bg-purple-600'
              : 'bg-gray-200'
          ]"
          style="width: calc(100% - 2rem);"
        ></div>
      </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  currentStatus: {
    type: String,
    required: true,
  },
  order: {
    type: Object,
    required: true,
  },
})

// const emits = defineEmits(['step-click'])

// Map status to corresponding date fields
// const statusToDateFieldMap = {
//   Pending: 'orderDate',
//   Packing: 'packedDate',
//   Shipping: 'shipmentDate',
//   Delayed: 'delayedDateFrom',
//   Arrived: 'arrivedDate',
//   Completed: 'completedDate',
//   Cancelled: 'cancelledDate',
// }

// Check if a step is completed
const isStepCompleted = (currentStatus, stepValue) => {
  const currentIndex = props.steps.findIndex(step => step.value === currentStatus)
  const stepIndex = props.steps.findIndex(step => step.value === stepValue)
  return stepIndex < currentIndex
}
</script>

<style scoped>
/* Add any scoped styles if needed */
</style>