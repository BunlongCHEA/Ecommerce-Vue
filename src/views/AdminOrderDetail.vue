<template>
  <div v-if="isAdmin" class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <!-- Page Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900">Admin Order Details</h1>
      </div>
    </header>

    <!-- Search Section -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white shadow p-4 rounded-lg flex items-center space-x-4">
        <!-- Readonly Input Box -->
        <input
          type="text"
          :value="searchType === 'orderNumber' ? 'ORD-' : 'TRK-'"
          readonly
          class="w-20 p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Number"
          class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
        <select
          v-model="searchType"
          @change="resetSearchQuery"
          class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="orderNumber">Order Number</option>
          <option value="trackingNumber">Tracking Number</option>
        </select>
        <button
          @click="filterOrders"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Order List -->
    <div class="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div
        v-for="(order, index) in filteredOrders"
        :key="index"
        class="bg-white shadow p-6 rounded-lg"
      >
        <!-- Order Header -->
        <div class="flex justify-between items-center border-b pb-4">
          <div>
            <h2 class="text-lg font-bold">Order #{{ order[0].orderNumber }}</h2>
            <p class="text-sm text-gray-500">Order placed: {{ order[0].orderDate ? new Date(order[0].orderDate).toLocaleDateString() : 'N/A' }}</p>
          </div>
          <a href="#" class="text-blue-500 text-sm underline">View invoice →</a>
        </div>

        <!-- Content Layout -->
        <div class="flex flex-col md:flex-row gap-6 mt-6 items-stretch">
          <!-- Order Items (Left Section) -->
          <div class="flex-1 overflow-y-auto overflow-x-hidden max-h-96">
            <table class="w-full border-collapse">
              <thead class="bg-gray-100">
                <tr>
                  <th class="text-left px-4 py-2 border-b font-medium text-gray-700">Item Summary</th>
                  <th class="text-center px-4 py-2 border-b font-medium text-gray-700">QTY</th>
                  <th class="text-center px-4 py-2 border-b font-medium text-gray-700">Price</th>
                  <th class="text-center px-4 py-2 border-b font-medium text-gray-700">Total Price</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order" :key="item.id" class="border-b">
                  <td class="flex items-center space-x-4 px-4 py-4">
                    <img
                      :src="item.imageUrl"
                      alt="Product image"
                      class="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 class="text-md font-semibold text-gray-900">{{ item.productName }}</h3>
                      <p class="text-sm text-gray-500">Colour: Blue</p>
                    </div>
                  </td>
                  <td class="text-center px-4 py-4 text-sm text-gray-700">x{{ item.quantity }}</td>
                  <td class="text-center px-4 py-4 text-sm text-gray-700">$ {{ item.price.toFixed(2) }}</td>
                  <td class="text-center px-4 py-4 text-sm text-gray-700">$ {{ item.totalPrice.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t">
                  <td colspan="3" class="text-right px-4 py-4 text-sm font-medium text-gray-700">Subtotal:</td>
                  <td class="text-center px-4 py-4 text-sm text-gray-700">$ {{ subtotal(order) }}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right px-4 py-4 text-sm font-medium text-gray-700">Discount:</td>
                  <td class="text-center px-4 py-4 text-sm text-gray-700">- $ {{ calCouponDiscount(order) }}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right px-4 py-4 text-sm font-medium text-gray-700">Shipping Cost:</td>
                  <td class="text-center px-4 py-4 text-sm text-gray-700">- $ {{ calShippingCost(order) }}</td>
                </tr>
                <tr class="border-t">
                  <td colspan="3" class="text-right px-4 py-4 text-sm font-medium text-gray-700">Total Final Amount:</td>
                  <td class="text-center px-4 py-4 text-sm font-bold text-gray-900">$ {{ calTotalFinalAmount(order) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Delivery and Shipping (Right Section) -->
          <div class="flex-1 space-y-4">
            <!-- Delivery Details -->
            <div>
              <h4 class="font-bold text-gray-900">Delivery Address</h4>
              <p class="text-sm text-gray-500">{{ order[0].address || "N/A" }}</p>
              <p class="text-sm text-gray-500">{{ order[0].region || "N/A" }}, {{ order[0].postalCode || "N/A" }}</p>
              <p class="text-sm text-gray-500">{{ order[0].countryName || "N/A" }}</p>
            </div>

            <!-- Shipping Details -->
            <div>
              <h4 class="font-bold text-gray-900">Shipping Updates</h4>
              <p class="font-bold text-sm text-blue-500">Tracking Number: {{ order[0].trackingNumber || "N/A" }}</p>
              <p class="text-sm text-gray-500">Shipping Cost: ${{ order[0].shippingCost }}</p>
            </div>

            <!-- Status Update -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Update Status</label>
              <select
                id="status"
                v-model="order[0].status"
                @change="updateOrderStatus(order[0].orderId, order[0].status)"
                class="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              >
                <option
                  v-for="step in statusSteps"
                  :key="step.value"
                  :value="step.value"
                >
                  {{ step.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-6">
          <p class="text-sm text-gray-500 mb-2">Status: {{ order[0].status }}</p>
          <div class="relative w-full h-2 bg-gray-200 rounded-full">
            <div
              class="absolute top-0 h-2 bg-blue-500 rounded-full"
              :style="{ width: `${(statusSteps.findIndex(step => step.value === order[0].status) + 1) / statusSteps.length * 100}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-sm text-gray-500 mt-2">
            <span v-for="step in statusSteps" :key="step.value">{{ step.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Forbidden Access -->
  <div v-else class="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
    <p class="text-lg font-bold text-red-500">403 - Forbidden: Admin Access Only</p>
  </div>
</template>

<script setup>
import api from "@/services/api";
import { ref, onMounted } from "vue";
import { useFetchUserId } from "@/composables/useFetchUserId";

const { userId, role, fetchUserId } = useFetchUserId();

// State variables
const orders = ref([]);
const groupedOrders = ref([]);
const filteredOrders = ref([]);
const searchQuery = ref("");
const searchType = ref("orderNumber");
const isAdmin = ref(false);

// Status steps
const statusSteps = [
  { name: 'Pending', value: 'Pending' },
  { name: 'Packing', value: 'Packing' },
  { name: 'Shipping', value: 'Shipping' },
  { name: 'Arrived', value: 'Arrived' },
  { name: 'Completed', value: 'Completed' },
  { name: 'Cancelled', value: 'Cancelled' },
];

// Fetch orders and group by orderId
const fetchOrders = async () => {
  try {
    if (isAdmin.value) {
      const response = await api.get("/admin/orderitem");
      orders.value = response.data;

      console.log("Orders response:", orders.value);
      groupOrders();
      filteredOrders.value = groupedOrders.value;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

// Group orders by orderId
const groupOrders = () => {
  const grouped = orders.value.reduce((acc, item) => {
    acc[item.orderId] = acc[item.orderId] || [];
    acc[item.orderId].push(item);
    return acc;
  }, {});
  groupedOrders.value = Object.values(grouped);
};

// Filter orders
const filterOrders = () => {
  const query = searchQuery.value.toLowerCase();
  if (searchType.value === "orderNumber") {
    filteredOrders.value = groupedOrders.value.filter(order =>
      order[0].orderNumber.toLowerCase().includes(query)
    );
  } else if (searchType.value === "trackingNumber") {
    filteredOrders.value = groupedOrders.value.filter(order =>
      order[0].trackingNumber.toLowerCase().includes(query)
    );
  } else {
    filteredOrders.value = groupedOrders.value;
  }
};

// Computed properties for calculations
const subtotal = (order) => {
  return order.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
};

const calCouponDiscount = (order) => {
  const discount = order[0]?.couponDiscount || 0;
  const subTotal = order.reduce((sum, item) => sum + item.totalPrice, 0);
  return ((discount / 100) * subTotal).toFixed(2);
};

const calShippingCost = (order) => {
  return order[0]?.shippingCost?.toFixed(2) || "0.00";
};

const calTotalFinalAmount = (order) => {
  return order[0]?.totalFinalAmount?.toFixed(2) || "0.00";
};

// Reset search query when searchType changes
const resetSearchQuery = () => {
  searchQuery.value = "";
};

// Update order status
const updateOrderStatus = async (orderId, status) => {
  try {
    await api.put(`/admin/orderitem/${orderId}/status`, { status });
    console.log(`Updated status for order ${orderId} to ${status}`);
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};

onMounted(async () => {
  await fetchUserId();
  isAdmin.value = role.value === "Admin";
  if (isAdmin.value) {
    fetchOrders();
  }
});
</script>

<style scoped>
/* Add custom styles here */
</style>