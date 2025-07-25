<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-white text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />
    <!-- Add the ConfirmDelete component here -->
    <ConfirmDelete
      v-model:show="showDeleteConfirm"
      :title="'Delete Payment Method'"
      :message="'Are you sure you want to delete this payment method? This action cannot be undone.'"
      :loading="deleteLoading"
      @confirm="confirmDeletePayment"
      @cancel="cancelDeletePayment"
    />
    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">

      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Cart'"
        :destination="'/cart'"
        :defaultTitle="'Manage Payment'"
        :waitDuration="durationWait"
      ></BackButton>

      <!-- Progress Bar -->
      <div class="w-full bg-white py-6 flex justify-center">
        <div class="w-full max-w-4xl bg-gray-50 border rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="relative flex items-center flex-1"
            >
              <!-- Step Circle -->
              <div
                class="flex flex-col items-center gap-2 cursor-pointer"
                @click="goToStep(index)"
              >
                <div
                  class="w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300"
                  :class="{
                    'bg-indigo-600 text-white border-indigo-600': currentStep >= index,
                    'bg-white text-indigo-600 border-indigo-600': currentStep < index,
                  }"
                >
                  <!-- Step Number or Checkmark -->
                  <template v-if="currentStep > index">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd" />
                    </svg>
                  </template>
                  <template v-else>
                    {{ index + 1 }}
                  </template>
                </div>
                <!-- Step Label -->
                <span
                  class="text-sm font-medium text-center"
                  :class="{ 'text-indigo-600': currentStep === index, 'text-gray-500': currentStep !== index }"
                >
                  {{ step }}
                </span>
              </div>

              <!-- Connector -->
              <div
                v-if="index < steps.length - 1 || index === steps.length - 1"
                class="flex-grow h-0.5 mx-2"
                :class="{ 'bg-indigo-600': currentStep > index, 'bg-gray-300': currentStep <= index }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="flex-grow flex flex-col items-center bg-white">
        <!-- Step 1: View Payment -->
        <div v-if="currentStep === 0" class="w-full max-w-3xl">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Your Payment Methods</h2>
          <div v-if="payments.length > 0" class="space-y-4">
            <div
              v-for="(payment, index) in payments"
              :key="index"
              class="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-500 hover:from-purple-500 hover:to-purple-600 transition duration-300 text-white"
            >
              <div>
                <p class="font-medium">{{ payment.paymentMethod }}</p>
                <p class="text-sm">Bank: {{ payment.bankName }}</p>
                <p class="text-sm">Card/Account: {{ maskCardNumber(payment.accountOrCardNumber) }}</p>
                <p class="text-sm">Card Holder: {{ payment.cardHolderName }}</p>
                <p class="text-sm">Expiry: {{ formatDate(payment.cardExpireDate) }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editPayment(index)"
                  class="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-blue-50 hover:text-blue-600"
                >
                  Edit
                </button>
                <!-- Update this button to prompt for deletion -->
                <button
                  @click="promptDeletePayment(index)"
                  class="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-red-50 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-6">
            No payment methods available.
          </div>
          <div class="mt-6">
            <button
              @click="goToStep(1)"
              class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        </div>

        <!-- Step 2: Add Payment -->
        <div v-if="currentStep === 1" class="w-full max-w-3xl">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Add a New Payment Method</h2>
          <form @submit.prevent="savePaymentData" class="space-y-4">
            <div class="flex flex-col gap-2">
              <label for="paymentMethod" class="text-sm font-medium text-gray-800">Payment Method</label>
              <select id="paymentMethod" v-model="newPaymentMethod" required class="px-4 py-2 border rounded-md"
                      @change="handlePaymentMethodChange">
                <option disabled value="">Select a card type</option>
                <option value="VISA">VISA</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="AMEX">American Express</option>
                <option value="DISCOVER">Discover</option>
                <option value="DEBIT">Debit Card</option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label for="bankName" class="text-sm font-medium text-gray-800">Bank Name</label>
              <select id="bankName" v-model="newBankName" required class="px-4 py-2 border rounded-md">
                <option disabled value="">Select a bank</option>
                <option v-for="(bank, index) in bankOptions" :key="index" :value="bank">
                  {{ bank }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-2">
              <label for="accountOrCardNumber" class="text-sm font-medium text-gray-800">Card Number</label>
              <input
                type="text"
                id="accountOrCardNumber"
                v-model="newAccountOrCardNumber"
                placeholder="Enter card number"
                required
                class="px-4 py-2 border rounded-md"
                @input="validateCardNumber"
                maxlength="19"
              />
              <p v-if="cardError" class="text-red-500 text-xs mt-1">{{ cardError }}</p>
              <p v-else-if="isCardValid" class="text-green-500 text-xs mt-1">Valid {{ newPaymentMethod }} card format</p>
            </div>
            <div class="flex flex-col gap-2">
              <label for="cardHolderName" class="text-sm font-medium text-gray-800">Card Holder Name (CAPITAL LETTERS)</label>
              <input
                type="text"
                id="cardHolderName"
                v-model="newCardHolderName"
                placeholder="NAME AS SHOWN ON CARD"
                required
                class="px-4 py-2 border rounded-md uppercase"
                @input="convertToUppercase"
              />
              <p class="text-xs text-gray-500">Card holder name will be stored in all capital letters</p>
            </div>
            <div class="flex space-x-4">
              <div class="flex flex-col gap-2 flex-1">
                <label for="cardExpireDate" class="text-sm font-medium text-gray-800">Expiry Date</label>
                <input
                  type="date"
                  id="cardExpireDate"
                  v-model="newCardExpireDate"
                  placeholder="yyyy-MM-dd"
                  required
                  class="px-4 py-2 border rounded-md"
                  :min="minExpiryDate"
                />
              </div>
              <div class="flex flex-col gap-2 w-1/3">
                <label for="cvv" class="text-sm font-medium text-gray-800">CVV</label>
                <input
                  type="password"
                  id="cvv"
                  v-model="newCVV"
                  placeholder="CVV"
                  required
                  class="px-4 py-2 border rounded-md"
                  maxlength="4"
                  @input="validateCVV"
                />
                <p v-if="cvvError" class="text-red-500 text-xs mt-1">{{ cvvError }}</p>
              </div>
            </div>
            <button 
              type="submit" 
              class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
              :disabled="!isFormValid"
            >
              Save Payment Method
            </button>
          </form>
        </div>

        <!-- Step 3: Final Payment -->
        <div v-if="currentStep === 2" class="w-full max-w-3xl">
          <h2 class="text-lg font-medium text-gray-800 mb-4">Confirm Your Payment</h2>
          <div class="p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
            <p class="text-sm font-medium text-gray-800"><strong>Payment Method:</strong> {{ newPaymentMethod }}</p>
            <p class="text-sm font-medium text-gray-800"><strong>Bank Name:</strong> {{ newBankName }}</p>
            <p class="text-sm font-medium text-gray-800"><strong>Card Number:</strong> {{ maskCardNumber(newAccountOrCardNumber) }}</p>
            <p class="text-sm font-medium text-gray-800"><strong>Card Holder:</strong> {{ newCardHolderName }}</p>
            <p class="text-sm font-medium text-gray-800"><strong>Expiry:</strong> {{ formatDate(newCardExpireDate) }}</p>
            <p class="text-sm font-medium text-gray-800"><strong>CVV:</strong> ***</p>
          </div>
          <div class="mt-6">
            <button
              @click="confirmPayment"
              class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'
import BackButton from '@/components/BackButton.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import ConfirmDelete from '@/components/ConfirmDelete.vue' // Import the ConfirmDelete component
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
// Update menu state
const isMenuOpen = ref(false);
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState;
}

// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

const durationWait = 1000 // Default wait time is 1 second
const loading = ref(false)
const popupRef = ref(null)

// Add state for delete confirmation
const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const paymentToDeleteIndex = ref(null)

const steps = ['View Payment', 'Add Payment', 'Final Payment']
const currentStep = ref(0)
const payments = ref([])
const editingIndex = ref(null) // Track the index of the payment being edited

// Fields for creating a new payment
const newPaymentMethod = ref('')
const newBankName = ref('')
const newAccountOrCardNumber = ref('')
const newCardHolderName = ref('') // New field for card holder name
const newCardExpireDate = ref('')
const newCVV = ref('') // New field for CVV

// Validation states
const cardError = ref('')
const cvvError = ref('')
const isCardValid = ref(false)

// Convert card holder name to uppercase
const convertToUppercase = () => {
  newCardHolderName.value = newCardHolderName.value.toUpperCase();
}

// Computed properties for validation
const minExpiryDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return (
    newPaymentMethod.value &&
    newBankName.value &&
    newAccountOrCardNumber.value &&
    newCardHolderName.value &&
    newCardExpireDate.value &&
    newCVV.value &&
    isCardValid.value &&
    !cvvError.value
  )
})

// Predefined bank options
const bankOptions = ref(['ABA', 'ACELADA', 'Woori', 'JTrust', 'Chase', 'Bank of America', 'Wells Fargo', 'Citibank'])

// Card validation patterns
const cardPatterns = {
  VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
  MASTERCARD: /^5[1-5][0-9]{14}$/,
  AMEX: /^3[47][0-9]{13}$/,
  DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
  DEBIT: /^[0-9]{13,19}$/ // Generic pattern for debit cards
}

// Handle payment method change
const handlePaymentMethodChange = () => {
  // Reset card number when payment method changes
  newAccountOrCardNumber.value = ''
  isCardValid.value = false
  cardError.value = ''
}

// Validate card number based on selected payment method
const validateCardNumber = () => {
  const cardNumber = newAccountOrCardNumber.value.replace(/\s/g, '')
  const pattern = cardPatterns[newPaymentMethod.value]
  
  if (!newPaymentMethod.value) {
    cardError.value = 'Please select a payment method first'
    isCardValid.value = false
    return
  }
  
  if (!cardNumber) {
    cardError.value = ''
    isCardValid.value = false
    return
  }

  // Format card number with spaces for better readability
  if (cardNumber.length > 0) {
    // Format the card number according to the card type
    if (newPaymentMethod.value === 'AMEX') {
      // Format for AMEX: XXXX XXXXXX XXXXX
      newAccountOrCardNumber.value = cardNumber
        .replace(/\s/g, '')
        .replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
        .trim()
    } else {
      // Format for other cards: XXXX XXXX XXXX XXXX
      newAccountOrCardNumber.value = cardNumber
        .replace(/\s/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim()
    }
  }

  // Check if card number matches the pattern
  if (pattern && pattern.test(cardNumber)) {
    // Validate using Luhn algorithm (checksum)
    if (validateLuhnAlgorithm(cardNumber)) {
      isCardValid.value = true
      cardError.value = ''
    } else {
      isCardValid.value = false
      cardError.value = 'Invalid card number (checksum error)'
    }
  } else {
    isCardValid.value = false
    cardError.value = `Invalid ${newPaymentMethod.value} card format`
  }
}

// Validate CVV
const validateCVV = () => {
  const cvv = newCVV.value.replace(/\D/g, '')
  newCVV.value = cvv

  const cvvLength = newPaymentMethod.value === 'AMEX' ? 4 : 3

  if (cvv.length !== cvvLength) {
    cvvError.value = `CVV must be ${cvvLength} digits`
  } else if (!/^\d+$/.test(cvv)) {
    cvvError.value = 'CVV must contain only digits'
  } else {
    cvvError.value = ''
  }
}

// Luhn algorithm for credit card validation
const validateLuhnAlgorithm = (cardNumber) => {
  let sum = 0
  let shouldDouble = false

  // Loop through values starting from the right
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

// Mask card number for display
const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return ''
  const last4 = cardNumber.slice(-4)
  return `•••• •••• •••• ${last4}`
}

// Fetch Payments for the Current User and Extract UserId
const fetchPayments = async () => {
  loading.value = true
  try {
    const response = await api.get('/payment')
    payments.value = response.data.map((payment) => ({
      paymentMethod: payment.paymentMethod,
      bankName: payment.bankName,
      accountOrCardNumber: payment.accountOrCardNumber,
      cardHolderName: payment.cardHolderName,
      cardExpireDate: payment.cardExpireDate,
      id: payment.id,
    }))
  } catch (error) {
    popupRef.value.show('Error fetching payments.', 'error')
    payments.value = []
  } finally {
    loading.value = false
  }
}

// Format date to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0] // Split on 'T' and return only the date part
}

// Save payment data and move to step 3
const savePaymentData = () => {
  // Ensure card holder name is in uppercase
  newCardHolderName.value = newCardHolderName.value.toUpperCase();
  
  // Validate form before proceeding
  if (
    !newPaymentMethod.value ||
    !newBankName.value ||
    !newAccountOrCardNumber.value ||
    !newCardHolderName.value ||
    !newCardExpireDate.value ||
    !newCVV.value
  ) {
    popupRef.value.show('Please fill in all the required fields.', 'error')
    return
  }

  // Additional validation
  if (!isCardValid.value) {
    popupRef.value.show('Please enter a valid card number.', 'error')
    return
  }

  if (cvvError.value) {
    popupRef.value.show('Please enter a valid CVV.', 'error')
    return
  }

  // Validation for editing
  if (editingIndex.value !== null) {
    // Update existing payment
    goToStep(2) // Move to step 3 for confirmation
  } else {
    // Add new payment
    goToStep(2) // Move to step 3 for confirmation
  }
}

// Confirm payment
const confirmPayment = async () => {
  loading.value = true
  try {
    if (editingIndex.value !== null) {
      // Update existing location
      await updatePayment()
    } else {
      // Create new payment
      await createPayment()
    }
    popupRef.value.show('Payment method saved successfully!', 'success')
  } catch (error) {
    popupRef.value.show('Error saving payment method.', 'error')
  } finally {
    loading.value = false
  }
}

// Create Payment and Register
const createPayment = async () => {
  try {
    // Validate UserId
    if (!userId.value) {
      popupRef.value.show('User ID is not available.', 'error')
      return
    }

    // Ensure card holder name is in uppercase before submission
    newCardHolderName.value = newCardHolderName.value.toUpperCase();

    const response = await api.post('/payment', {
      paymentMethod: newPaymentMethod.value,
      bankName: newBankName.value,
      accountOrCardNumber: newAccountOrCardNumber.value,
      cardHolderName: newCardHolderName.value,
      cardExpireDate: newCardExpireDate.value,
      cvv: parseInt(newCVV.value),
      userId: userId.value,
    })

    // Refresh the list of payments
    await fetchPayments()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    if (error.response) {
      popupRef.value.show(`Server error: ${error.response.data}`, 'error')
    } else {
      popupRef.value.show(`Error creating payment: ${error.message}`, 'error')
    }
    throw error; // Rethrow to be caught by the caller
  }
}

// Update existing payment
const updatePayment = async () => {
  const paymentId = payments.value[editingIndex.value].id

  try {
    // Ensure card holder name is in uppercase before submission
    newCardHolderName.value = newCardHolderName.value.toUpperCase();
    
    const response = await api.put(`/payment/${paymentId}`, {
      id: paymentId,
      paymentMethod: newPaymentMethod.value,
      bankName: newBankName.value,
      accountOrCardNumber: newAccountOrCardNumber.value,
      cardHolderName: newCardHolderName.value,
      cardExpireDate: newCardExpireDate.value,
      cvv: parseInt(newCVV.value),
      userId: userId.value,
    })

    // Refresh the list of payments
    await fetchPayments()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    popupRef.value.show('Error updating payment.', 'error')
    throw error; // Rethrow to be caught by the caller
  }
}

// Edit and delete payment
const editPayment = (index) => {
  const payment = payments.value[index]
  editingIndex.value = index // Set the index for editing
  newPaymentMethod.value = payment.paymentMethod
  newBankName.value = payment.bankName
  newAccountOrCardNumber.value = payment.accountOrCardNumber
  newCardHolderName.value = payment.cardHolderName ? payment.cardHolderName.toUpperCase() : ''
  newCardExpireDate.value = formatDate(payment.cardExpireDate)
  newCVV.value = '' // CVV is not returned from the server
  goToStep(1)
}

// New methods for deletion confirmation
const promptDeletePayment = (index) => {
  paymentToDeleteIndex.value = index;
  showDeleteConfirm.value = true;
}

const confirmDeletePayment = async () => {
  if (paymentToDeleteIndex.value === null) return;
  
  deleteLoading.value = true;
  try {
    const paymentId = payments.value[paymentToDeleteIndex.value].id;
    await api.delete(`/payment/${paymentId}`);
    payments.value.splice(paymentToDeleteIndex.value, 1);
    popupRef.value.show('Payment method deleted successfully.', 'success');
  } catch (error) {
    console.error('Error deleting payment:', error);
    popupRef.value.show('Error deleting payment.', 'error');
  } finally {
    deleteLoading.value = false;
    showDeleteConfirm.value = false;
    paymentToDeleteIndex.value = null;
  }
}

const cancelDeletePayment = () => {
  paymentToDeleteIndex.value = null;
}

// Reset the form
const resetForm = () => {
  newPaymentMethod.value = ''
  newBankName.value = ''
  newAccountOrCardNumber.value = ''
  newCardHolderName.value = ''
  newCardExpireDate.value = ''
  newCVV.value = ''
  editingIndex.value = null // Reset editing index
  isCardValid.value = false
  cardError.value = ''
  cvvError.value = ''
}

// Navigate between steps
const goToStep = (step) => {
  // Step 3 Validation: Ensure data exists from Step 2 before proceeding
  if (
    step === 2 &&
    (!newPaymentMethod.value ||
      !newBankName.value ||
      !newAccountOrCardNumber.value ||
      !newCardHolderName.value ||
      !newCardExpireDate.value ||
      !newCVV.value)
  ) {
    popupRef.value.show('Please fill in all the required fields before proceeding.', 'error')
    return
  }
  currentStep.value = step
}

// Fetch payments on page load
onMounted(async () => {
  await fetchUserId()
  await fetchPayments()
})
</script>

<style scoped>
/* Force uppercase styling for card holder name input */
input.uppercase {
  text-transform: uppercase;
}
</style>