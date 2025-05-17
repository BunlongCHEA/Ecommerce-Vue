<template>
  <div class="min-h-screen w-full flex flex-col overflow-auto bg-white text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- <div class="flex justify-between items-center px-4 py-4 bg-transparent text-white shadow backdrop-blur-md">
      <button
        @click="$router.push('/cart')"
        class="flex items-center gap-2 font-medium text-black hover:bg-gradient-to-r from-gray-300/50 to-gray-500/50 px-4 py-2 rounded-md transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0L2.293 10l6-6a1 1 0 011.414 1.414L4.414 10l5.293 5.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Cart
      </button>
      <h1 class="text-2xl font-bold text-black">Manage Payment</h1>
      <div class="w-24"></div>
    </div> -->

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
              <p class="font-medium">{{ payment.PaymentMethod }}</p>
              <p class="text-sm">Bank: {{ payment.BankName }}</p>
              <p class="text-sm">Card/Account: {{ payment.AccountOrCardNumber }}</p>
              <p class="text-sm">Expiry: {{ formatDate(payment.CardExpireDate) }}</p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editPayment(index)"
                class="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-blue-50 hover:text-blue-600"
              >
                Edit
              </button>
              <button
                @click="deletePayment(index)"
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
            <select id="paymentMethod" v-model="newPaymentMethod" required class="px-4 py-2 border rounded-md">
              <option disabled value="">Select a payment method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
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
            <label for="accountOrCardNumber" class="text-sm font-medium text-gray-800">Card/Account Number</label>
            <input
              type="text"
              id="accountOrCardNumber"
              v-model="newAccountOrCardNumber"
              placeholder="Enter card/account number"
              required
              class="px-4 py-2 border rounded-md"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="cardExpireDate" class="text-sm font-medium text-gray-800">Expiry Date</label>
            <input
              type="date"
              id="cardExpireDate"
              v-model="newCardExpireDate"
              placeholder="yyyy-MM-dd"
              required
              class="px-4 py-2 border rounded-md"
            />
          </div>
          <button type="submit" class="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors">
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
          <p class="text-sm font-medium text-gray-800"><strong>Card/Account:</strong> {{ newAccountOrCardNumber }}</p>
          <p class="text-sm font-medium text-gray-800"><strong>Expiry:</strong> {{ newCardExpireDate }}</p>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'
import BackButton from '@/components/BackButton.vue'
import { useFetchUserId } from '@/composables/useFetchUserId.js'

// Data
// Use the composable for fetching user ID
const { userId, fetchUserId } = useFetchUserId()

const durationWait = 1000 // Default wait time is 1 second
const loading = ref(false)
const popupRef = ref(null)

const steps = ['View Payment', 'Add Payment', 'Final Payment']
const currentStep = ref(0)
const payments = ref([])
// const userId = ref(null)
const editingIndex = ref(null) // Track the index of the payment being edited

// Fields for creating a new payment
const newPaymentMethod = ref('')
const newBankName = ref('')
const newAccountOrCardNumber = ref('')
const newCardExpireDate = ref('')

// Predefined bank options
const bankOptions = ref(['ABA', 'ACELADA', 'Woori', 'JTrust'])

// Fetch Payments for the Current User and Extract UserId
const fetchPayments = async () => {
  try {
    const response = await api.get('/payment')

    // Log the raw response for debugging purposes
    // console.log('API Response:', response.data)

    payments.value = response.data.map((payment) => ({
      PaymentMethod: payment.paymentMethod,
      BankName: payment.bankName,
      AccountOrCardNumber: payment.accountOrCardNumber,
      CardExpireDate: payment.cardExpireDate,
      Id: payment.id,
    }))
  } catch (error) {
    // console.error('Error fetching payments:', error)
    popupRef.value.show('Error fetching payments.', 'error')
    payments.value = []
  }
}

// Fetch the logged-in user's ID from localStorage or cookies
// const fetchUserId = () => {
//   try {
//     // First, attempt to retrieve userId from localStorage
//     const storedUserId = localStorage.getItem('userId')
//     userId.value = storedUserId
//     console.log('Logged-in User ID (from localStorage):', userId.value)

//     // If not found in localStorage, attempt to retrieve it from cookies
//     const cookies = document.cookie.split('; ')
//     console.log('Cookies:', cookies)
//     const userIdCookie = cookies.find((row) => row.startsWith('userId='))
//     userId.value = userIdCookie.split('=')[1]
//     console.log('Logged-in User ID (from cookies):', userId.value)
//   } catch (error) {
//     console.error('Error retrieving User ID:', error)
//   }
// }

// Format date to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return ''
  return dateString.split('T')[0] // Split on 'T' and return only the date part
}

// Save payment data and move to step 3
const savePaymentData = () => {
  console.log(
    'Saving payment data:',
    newPaymentMethod.value,
    newBankName.value,
    newAccountOrCardNumber.value,
    newCardExpireDate.value,
  )

  // Save the entered payment data in the form
  if (
    !newPaymentMethod.value ||
    !newBankName.value ||
    !newAccountOrCardNumber.value ||
    !newCardExpireDate.value
  ) {
    popupRef.value.show('Please fill in all the required fields.', 'error')
    return
  }

  // Validation for editing
  if (editingIndex.value !== null) {
    // Update existing payment
    // updatePayment()
    goToStep(2) // Move to step 3 for confirmation
  } else {
    // Add new payment
    goToStep(2) // Move to step 3 for confirmation
  }
}

// Confirm payment
const confirmPayment = async () => {
  if (editingIndex.value !== null) {
    // Update existing location
    await updatePayment()
  } else {
    // Create new payment
    await createPayment()
  }
}

// Create Payment and Register
const createPayment = async () => {
  try {
    // Validate UserId
    if (!userId.value) {
      console.error('UserId is not available.')
    }
    console.log('Creating payment with UserId:', userId.value)

    const response = await api.post('/payment', {
      PaymentMethod: newPaymentMethod.value,
      BankName: newBankName.value,
      AccountOrCardNumber: newAccountOrCardNumber.value,
      CardExpireDate: newCardExpireDate.value,
      UserId: userId.value,
    })
    console.log('Payment method created successfully:', response.data)

    // Refresh the list of payments
    await fetchPayments()

    // Reset the form and go back to the first step
    // newPaymentMethod.value = ''
    // newBankName.value = ''
    // newAccountOrCardNumber.value = ''
    // newCardExpireDate.value = ''
    resetForm()
    goToStep(0)
  } catch (error) {
    if (error.response) {
      // Log server error details
      console.error('Server error:', error.response.data)
    } else {
      // Log client-side error
      console.error('Error creating payment:', error.message)
    }
  }
}

// Update existing payment
const updatePayment = async () => {
  const paymentId = payments.value[editingIndex.value].Id

  console.log(
    'Updating payment:',
    paymentId,
    newPaymentMethod.value,
    newBankName.value,
    newAccountOrCardNumber.value,
    newCardExpireDate.value,
    userId.value,
  )

  try {
    const response = await api.put(`/payment/${paymentId}`, {
      id: paymentId,
      paymentMethod: newPaymentMethod.value,
      bankName: newBankName.value,
      accountOrCardNumber: newAccountOrCardNumber.value,
      cardExpireDate: newCardExpireDate.value,
      userId: userId.value,
    })
    console.log('Payment updated successfully:', response.data)

    // Refresh the list of payments
    await fetchPayments()

    // Reset the form and go back to the first step
    resetForm()
    goToStep(0)
  } catch (error) {
    console.error('Error updating payment:', error)
  }
}
// Edit and delete payment
const editPayment = (index) => {
  const payment = payments.value[index]
  console.log('Editing payment with Index:', payment)

  editingIndex.value = index // Set the index for editing
  newPaymentMethod.value = payment.PaymentMethod
  newBankName.value = payment.BankName
  newAccountOrCardNumber.value = payment.AccountOrCardNumber
  newCardExpireDate.value = payment.CardExpireDate
  goToStep(1)
}

const deletePayment = async (index) => {
  try {
    const paymentId = payments.value[index].Id
    await api.delete(`/payment/${paymentId}`)
    payments.value.splice(index, 1)
  } catch (error) {
    console.error('Error deleting payment:', error)
  }
}

// Reset the form
const resetForm = () => {
  newPaymentMethod.value = ''
  newBankName.value = ''
  newAccountOrCardNumber.value = ''
  newCardExpireDate.value = ''
  editingIndex.value = null // Reset editing index
}

// Navigate between steps
const goToStep = (step) => {
  // Step 3 Validation: Ensure data exists from Step 2 before proceeding
  if (
    step === 2 &&
    (!newPaymentMethod.value ||
      !newBankName.value ||
      !newAccountOrCardNumber.value ||
      !newCardExpireDate.value)
  ) {
    popupRef.value.show('Please fill in all the required fields before proceeding.', 'error')
    return
  }
  currentStep.value = step
}

// Fetch payments on page load
// onMounted(fetchPayments)
onMounted(async () => {
  await fetchPayments()
  await fetchUserId()
})
</script>

<style scoped>

</style>
