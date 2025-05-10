<template>
  <div class="app-container">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div
        v-for="(step, index) in steps"
        :key="index"
        :class="['progress-step', { active: currentStep === index }]"
        @click="goToStep(index)"
      >
        {{ step }}
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Step 1: View Payment -->
      <div v-if="currentStep === 0">
        <h2 class="subtitle">Your Payment Methods</h2>
        <div v-if="payments.length > 0" class="payment-list">
          <div v-for="(payment, index) in payments" :key="index" class="payment-box">
            <div class="payment-info">
              <p class="payment-method">{{ payment.PaymentMethod }}</p>
              <p class="payment-detail">Bank: {{ payment.BankName }}</p>
              <p class="payment-detail">Card/Account: {{ payment.AccountOrCardNumber }}</p>
              <p class="payment-detail">Expiry: {{ formatDate(payment.CardExpireDate) }}</p>
            </div>
            <div class="button-group">
              <button @click="editPayment(index)" class="button secondary">Edit</button>
              <button @click="deletePayment(index)" class="button danger">Delete</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">No payment methods available.</div>
        <div class="action">
          <button @click="goToStep(1)" class="button primary">Add Payment Method</button>
        </div>
      </div>

      <!-- Step 2: Add Payment -->
      <div v-if="currentStep === 1">
        <h2 class="subtitle">Add a New Payment Method</h2>
        <form @submit.prevent="savePaymentData" class="payment-form">
          <div class="form-group">
            <label for="paymentMethod">Payment Method</label>
            <select id="paymentMethod" v-model="newPaymentMethod" required>
              <option disabled value="">Select a payment method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bankName">Bank Name</label>
            <select id="bankName" v-model="newBankName" required>
              <option disabled value="">Select a bank</option>
              <option v-for="(bank, index) in bankOptions" :key="index" :value="bank">
                {{ bank }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="accountOrCardNumber">Card/Account Number</label>
            <input
              type="text"
              id="accountOrCardNumber"
              v-model="newAccountOrCardNumber"
              placeholder="Enter card/account number"
              required
            />
          </div>
          <div class="form-group">
            <label for="cardExpireDate">Expiry Date</label>
            <input
              type="date"
              id="cardExpireDate"
              v-model="newCardExpireDate"
              placeholder="yyyy-MM-dd"
              required
            />
          </div>
          <button type="submit" class="button primary">Save Payment Method</button>
        </form>
      </div>

      <!-- Step 3: Final Payment -->
      <div v-if="currentStep === 2">
        <h2 class="subtitle">Confirm Your Payment</h2>
        <div class="payment-summary">
          <p><strong>Payment Method:</strong> {{ newPaymentMethod }}</p>
          <p><strong>Bank Name:</strong> {{ newBankName }}</p>
          <p><strong>Card/Account:</strong> {{ newAccountOrCardNumber }}</p>
          <p><strong>Expiry:</strong> {{ newCardExpireDate }}</p>
        </div>
        <div class="action">
          <!-- <button @click="goToStep(0)" class="button primary">Finish</button> -->
          <button @click="confirmPayment" class="button primary">Finish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

// Components
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import PopupMessage from '@/components/PopupMessage.vue'

const loading = ref(false)
const popupRef = ref(null)

const steps = ['View Payment', 'Add Payment', 'Final Payment']
const currentStep = ref(0)
const payments = ref([])
const userId = ref(null)
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
const fetchUserId = () => {
  try {
    // First, attempt to retrieve userId from localStorage
    const storedUserId = localStorage.getItem('userId')
    userId.value = storedUserId
    console.log('Logged-in User ID (from localStorage):', userId.value)

    // If not found in localStorage, attempt to retrieve it from cookies
    const cookies = document.cookie.split('; ')
    console.log('Cookies:', cookies)
    const userIdCookie = cookies.find((row) => row.startsWith('userId='))
    userId.value = userIdCookie.split('=')[1]
    console.log('Logged-in User ID (from cookies):', userId.value)
  } catch (error) {
    console.error('Error retrieving User ID:', error)
  }
}

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
/* General container styles */
.app-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  width: 100vw;
  height: auto;
  box-sizing: border-box;
  /* overflow-y: auto; */
  background-color: #f9f9f9;
}

/* Progress bar styles */
.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.progress-step {
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #e0e0e0;
  cursor: pointer;
}

.progress-step.active {
  background-color: #007bff;
  color: #fff;
}

/* Subtitle styles */
.subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
}

/* Payment list styles (stacked layout) */
.payment-list {
  display: flex;
  flex-direction: column; /* Stacked layout */
  gap: 1rem;
}

.payment-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.payment-info {
  flex: 1; /* Take up available space */
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-method {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.payment-detail {
  color: #777;
}

.payment-summary {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #333;
}

/* Form styles */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-bank {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

input,
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
}

input:focus,
select:focus {
  border-color: #007bff;
  outline: none;
}

/* Action button styles */
/* .button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
} */

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.button.primary {
  background-color: #28a745;
  color: #fff;
}

.button.primary:hover {
  background-color: #218838;
}

.button.secondary {
  background-color: #17a2b8;
  color: #fff;
}

.button.secondary:hover {
  background-color: #138496;
}

.button.danger {
  background-color: #dc3545;
  color: #fff;
}

.button.danger:hover {
  background-color: #c82333;
}

/* .button.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background-color: #17a2b8;
}

.button.small:hover {
  background-color: #138496;
} */
</style>
