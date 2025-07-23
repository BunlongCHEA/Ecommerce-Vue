<template>
  <div v-if="isAdmin" class="min-h-screen w-full flex flex-col overflow-auto bg-gray-100 text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />
    
    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">
    <BackButton
      :buttonLabel="'Back to Products'"
      :destination="'/product'"
      :defaultTitle="'Admin Order Details'"
      :waitDuration="durationWait"
    />
    
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

        <!-- Search Type Dropdown -->
        <select
          v-model="searchType"
          @change="resetSearchQuery"
          class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="orderNumber">Order Number</option>
          <option value="trackingNumber">Tracking Number</option>
        </select>
        
        <!-- Status Multi-Select Filter using vue-multiselect -->
          <div class="min-w-[500px]">
            <Multiselect
              v-model="selectedStatuses"
              :options="statusSteps"
              :multiple="true"
              :close-on-select="false"
              :clear-on-select="false"
              :preserve-search="true"
              placeholder="Select status"
              label="name"
              track-by="value"
              :preselect-first="false"
              :show-labels="false"
              :allow-empty="true"
              class="w-full"
            />
          </div>

        <button
          @click="handleSearch"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Order List -->
    <div class="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div
        v-for="(order, index) in groupedOrders"
        :key="index"
        class="bg-white shadow p-6 rounded-lg"
      >
        <!-- Order Header -->
        <div class="flex justify-between items-center border-b pb-4">
          <div>
            <h2 class="text-lg font-bold">{{ order[0].orderNumber }}</h2>
            <p class="text-sm text-gray-500">Order placed: {{ order[0].orderDate ? formatDate(order[0].orderDate) : 'N/A' }}</p>
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
                v-model="tempStatusMap[order[0].orderId]"
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
              <!-- Save Status Button -->
              <button
                @click="updateOrderStatus(order[0].orderId, tempStatusMap[order[0].orderId])"
                class="mt-2 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-6">
          <p class="text-sm text-gray-500 mb-2">Status: {{ getOrderStatusMessage(order[0]) }}</p>
          <ProgressBar
                :steps="statusSteps"
                :currentStatus="order[0].status"
                :order="order"
              />
        </div>
      </div>
      
      <!-- Pagination Component -->
      <div class="flex justify-center mt-8 mb-8">
        <PaginationOption
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          :totalItems="totalOrders"
          :itemsPerPageOptions="itemsPerPageOptions"
          @update:currentPage="updateCurrentPage"
          @update:itemsPerPage="updateItemsPerPage"
        />
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
import { ref, onMounted, computed, watch } from "vue";
import { useFetchUserId } from "@/composables/useFetchUserId";

import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

import ProgressBar from '@/components/ProgressBar.vue'
import BackButton from '@/components/BackButton.vue'
import HamburgerMenu from '@/components/HamburgerMenu.vue'
import PaginationOption from "@/components/PaginationOption.vue";
import PopupMessage from '@/components/PopupMessage.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

// Duration for the back button & Loading state & popup reference
const durationWait = 1000
const loading = ref(false);
const popupRef = ref(null);

// User authentication
const { userId, role, fetchUserId } = useFetchUserId();

// Add a temporary status map to store selected values before saving
const tempStatusMap = ref({});

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 20, 50, 100];
const totalOrders = ref(0);
const totalPages = ref(0);

// State variables
const orders = ref([]);
const groupedOrders = ref([]);
const filteredOrders = ref([]);
const searchQuery = ref("");
const searchType = ref("orderNumber");
const isAdmin = ref(false);

// Update menu state
const isMenuOpen = ref(false);
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState;
};

// Declare For Progress Bar
const statusSteps = [
  { name: 'Pending', value: 'Pending', icon: 'fas fa-hourglass-start' },
  { name: 'Packing', value: 'Packing', icon: 'fas fa-box' },
  { name: 'Shipping', value: 'Shipping', icon: 'fas fa-truck' },
  { name: 'Delayed', value: 'Delayed', icon: 'fas fa-exclamation-triangle' },
  { name: 'Arrived', value: 'Arrived', icon: 'fas fa-check-circle' },
  { name: 'Completed', value: 'Completed', icon: 'fas fa-trophy' },
  { name: 'Cancelled', value: 'Cancelled', icon: 'fas fa-times-circle' },
]
const selectedStatuses = ref([statusSteps[0]]); // Start with empty array to avoid default filter

// Watch for changes in pagination, filters, or selected statuses and refetch data
watch([currentPage, itemsPerPage], () => {
  fetchOrders();
}, { deep: true }); // Deep watch for the selectedStatuses array

// Fetch orders with server-side pagination and filtering
const fetchOrders = async () => {
  try {
    if (isAdmin.value) {
      loading.value = true;
      
      // Create URLSearchParams object for query parameters
      const params = new URLSearchParams();
      
      // Add pagination parameters
      params.append('pageNumber', currentPage.value);
      params.append('pageSize', itemsPerPage.value);
      
      // Add search query if present
      if (searchQuery.value.trim()) {
        params.append('searchQuery', searchQuery.value.trim());
        params.append('searchType', searchType.value);
      }
      
      // Add status filters if selected
      if (selectedStatuses.value && selectedStatuses.value.length > 0) {
        selectedStatuses.value.forEach(status => {
          params.append('statuses', status.value);
        });
      }
      
      // Make API request with query parameters
      const response = await api.get(`/admin/orderitem?${params.toString()}`);
      console.log("Response Data:", response.data);
      
      // Update pagination data
      orders.value = response.data.orderItems;
      totalOrders.value = response.data.totalCount;
      totalPages.value = response.data.totalPages;
      
      // Group the orders by orderId
      groupOrders();
      
      // Initialize tempStatusMap with current statuses
      orders.value.forEach(item => {
        if (item.orderId && !tempStatusMap.value[item.orderId]) {
          tempStatusMap.value[item.orderId] = item.status;
        }
      });
      
      // Check for delayed orders
      await checkForDelayedOrders();
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    if (popupRef.value) {
      popupRef.value.show("Error fetching orders. Please try again.", "error");
    }
  } finally {
    loading.value = false;
  }
};

// All orders are grouped by each orderId
const groupOrders = () => {
  const grouped = orders.value.reduce((acc, item) => {
    // Each key is a unique orderId
    acc[item.orderId] = acc[item.orderId] || [];
    // Push the item into the array for that orderId
    acc[item.orderId].push(item);
    return acc;
  }, {});
  // Stores them in groupedOrders.value using Object.values(grouped)
  groupedOrders.value = Object.values(grouped);
};

// When search button is clicked, reset pagination and fetch orders
const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on new search
  fetchOrders();
};

// Update current page
const updateCurrentPage = (newPage) => {
  currentPage.value = newPage;
};

// Update items per page
const updateItemsPerPage = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1; // Reset to first page when items per page changes
};

// Format date to readable format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString)

  const localDateTime = date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false
  })

  return localDateTime;
}

// Get the current status message for the order
const getOrderStatusMessage = (order) => {
  if (!order) return 'Status not available';
  
  // Map of statuses to corresponding date fields
  const statusToDateFieldMap = ref({
    Pending: 'orderDate',
    Packing: 'packedDate',
    Shipping: 'shipmentDate',
    Delayed: 'delayedDateFrom',
    Arrived: 'arrivedDate',
    Completed: 'completedDate',
    Cancelled: 'cancelledDate',
  });

  // Get the date field based on the order status
  const dateField = statusToDateFieldMap.value[order.status];
  
  // Get the date value
  const dateValue = dateField ? order[dateField] : null;
  
  // Return the formatted message if the date exists, otherwise return a default message
  return dateValue
    ? `${order.status} on ${formatDate(dateValue)}`
    : `${order.status} date not available`;
}

// Computed properties for calculations
const subtotal = (order) => {
  if (!order || !order.length) return "0.00";
  return order.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2);
};

const calCouponDiscount = (order) => {
  if (!order || !order.length) return "0.00";
  const discount = order[0]?.couponDiscountPercentage || 0;
  const subTotal = order.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  return ((discount / 100) * subTotal).toFixed(2);
};

const calShippingCost = (order) => {
  if (!order || !order.length || !order[0]) return "0.00";
  return order[0]?.shippingCost?.toFixed(2) || "0.00";
};

const calTotalFinalAmount = (order) => {
  if (!order || !order.length || !order[0]) return "0.00";
  return order[0]?.totalFinalAmount?.toFixed(2) || "0.00";
};

// Reset search query when searchType changes
const resetSearchQuery = () => {
  searchQuery.value = "";
};

// Check for delayed orders when the page opens
const checkForDelayedOrders = async () => {
  const today = new Date();
  
  // Process each order group
  for (const orderGroup of groupedOrders.value) {
    if (!orderGroup || !orderGroup.length) continue;
    
    const order = orderGroup[0]; // First item in each group contains order information
    
    // Only check orders with "Shipping" status
    if (order && order.status === "Shipping") {
      try {
        // Check if shipmentId is valid
        if (!order.shipmentId) continue;
        
        // Fetch the shipment data
        const shipmentResponse = await api.get(`/admin/shipment/${order.shipmentId}`);
        const shipment = shipmentResponse.data;
        
        // Compare dates if expectedDate exists
        if (shipment && shipment.expectedDate) {
          const expectedDate = new Date(shipment.expectedDate);
          
          // If today is past the expected date and not already delayed
          if (today > expectedDate && !shipment.delayedDateFrom) {
            console.log(`Order ${order.orderNumber} is delayed. Expected: ${expectedDate}, Today: ${today}`);
            
            // Update the order status to "Delayed"
            await updateOrderStatus(order.orderId, "Delayed");
          }
        }
      } catch (error) {
        console.error(`Error checking delayed status for order ${order?.orderNumber || 'unknown'}:`, error);
      }
    }
  }
};

// Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId || !newStatus) {
    console.error("Missing orderId or newStatus for updateOrderStatus");
    return;
  }
  
  loading.value = true;
  try {
    const today = new Date().toISOString();
    console.log("Current Date and Time (UTC): 2025-05-28 16:22:49");
    console.log("Current User's Login: BunlongCHEA");
    console.log("Today:", today);
    console.log("newStatus", newStatus); 
    
    // Fetch the order details
    const orderResponse = await api.get(`/admin/order/${orderId}`);
    if (!orderResponse.data) {
      throw new Error("Failed to fetch order data");
    }
    
    const orderData = ref(null);
    orderData.value = {
      id: orderResponse.data.id,
      orderNumber: orderResponse.data.orderNumber,
      orderDate: orderResponse.data.orderDate,
      status: orderResponse.data.status,
      totalFinalAmount: orderResponse.data.totalFinalAmount,
      totalQuantity: orderResponse.data.totalQuantity,
      totalAmount: orderResponse.data.totalAmount,
      cancelledDate: orderResponse.data.cancelledDate,
      completedDate: orderResponse.data.completedDate,
      shipmentId: orderResponse.data.shipmentId,
      paymentId: orderResponse.data.paymentId,
      couponUserListId: orderResponse.data.couponUserListId,
      packedDate: orderResponse.data.packedDate,
    };
    console.log("Order Data:", orderData.value);

    // Create a copy of order data for updating
    const updatedOrder = ref({ ...orderData.value });
    console.log("Updated order:", updatedOrder.value);
    updatedOrder.value.status = newStatus;

    // Fetch shipment data if available
    const shipment = ref(null);
    if (updatedOrder.value.shipmentId) {
      const shipmentResponse = await api.get(`/admin/shipment/${updatedOrder.value.shipmentId}`);
      shipment.value = {
        id: shipmentResponse.data.id,
        trackingNumber: shipmentResponse.data.trackingNumber,
        shipmentDate: shipmentResponse.data.shipmentDate,
        expectedDate: shipmentResponse.data.expectedDate,
        delayedDateFrom: shipmentResponse.data.delayedDateFrom,
        arrivedDate: shipmentResponse.data.arrivedDate,
        shippingCost: shipmentResponse.data.shippingCost,
        shipmentTypeId: shipmentResponse.data.shipmentTypeId,
        locationId: shipmentResponse.data.locationId,
      };
    }
    console.log("Shipment Data:", shipment.value);
    
    // Handle status-specific updates
    switch (newStatus) {
      case "Pending":
        // Reset all dates except order date
        if (shipment.value) {
          shipment.value.shipmentDate = null;
          shipment.value.expectedDate = null;
          shipment.value.arrivedDate = null;
          shipment.value.delayedDateFrom = null;
          await api.put(`/admin/shipment/${updatedOrder.value.shipmentId}`, shipment.value);
        }
        updatedOrder.value.packedDate = null;
        updatedOrder.value.completedDate = null;
        updatedOrder.value.cancelledDate = null;
        break;
        
      case "Packing":
        if (shipment.value) {
          shipment.value.shipmentDate = null;
          shipment.value.expectedDate = null;
          shipment.value.arrivedDate = null;
          shipment.value.delayedDateFrom = null;
          await api.put(`/admin/shipment/${updatedOrder.value.shipmentId}`, shipment.value);
        }
        updatedOrder.value.packedDate = today;
        updatedOrder.value.completedDate = null;
        updatedOrder.value.cancelledDate = null;
        break;
        
      case "Shipping":
        // Set packed date if not already set
        if (updatedOrder.value.packedDate === null) {
          updatedOrder.value.packedDate = today;
        }
        
        if (shipment.value) {
          shipment.value.shipmentDate = today;
          shipment.value.expectedDate = new Date(new Date().setDate(new Date().getDate() + 10)).toISOString();
          shipment.value.arrivedDate = null;
          shipment.value.delayedDateFrom = null;
          await api.put(`/admin/shipment/${updatedOrder.value.shipmentId}`, shipment.value);
        }
        
        updatedOrder.value.completedDate = null;
        updatedOrder.value.cancelledDate = null;
        break;
        
      case "Delayed":
        // Set packed date if not already set
        if (updatedOrder.value.packedDate === null) {
          updatedOrder.value.packedDate = today;
        }
        
        if (shipment.value) {
          if (shipment.value.shipmentDate === null) {
            shipment.value.shipmentDate = today;
            shipment.value.expectedDate = new Date(new Date().setDate(new Date().getDate() + 10)).toISOString();
          }
          
          shipment.value.delayedDateFrom = today;
          shipment.value.arrivedDate = null;
          await api.put(`/admin/shipment/${updatedOrder.value.shipmentId}`, shipment.value);
        }
        
        updatedOrder.value.completedDate = null;
        updatedOrder.value.cancelledDate = null;
        break;
        
      case "Arrived":
        // Set packed date if not already set
        if (updatedOrder.value.packedDate === null) {
          updatedOrder.value.packedDate = today;
        }
        
        if (shipment.value) {
          if (shipment.value.shipmentDate === null) {
            shipment.value.shipmentDate = today;
            shipment.value.expectedDate = new Date(new Date().setDate(new Date().getDate() + 10)).toISOString();
          }
          
          shipment.value.arrivedDate = today;
          await api.put(`/admin/shipment/${updatedOrder.value.shipmentId}`, shipment.value);
        }
        
        updatedOrder.value.completedDate = null;
        updatedOrder.value.cancelledDate = null;
        break;
        
      case "Completed":
        // Set packed date if not already set
        if (updatedOrder.value.packedDate === null) {
          updatedOrder.value.packedDate = today;
        }
        
        if (shipment.value) {
          if (shipment.value.shipmentDate === null) {
            shipment.value.shipmentDate = today;
            shipment.value.expectedDate = new Date(new Date().setDate(new Date().getDate() + 10)).toISOString();
          }
          
          if (shipment.value.arrivedDate === null) {
            shipment.value.arrivedDate = today;
          }
          
          await api.put(`/admin/shipment/${updatedOrder.value.shipmentId}`, shipment.value);
        }
        
        updatedOrder.value.completedDate = today;
        updatedOrder.value.cancelledDate = null;
        break;
        
      case "Cancelled":
        updatedOrder.value.cancelledDate = today;
        break;
    }
    
    // Save order data
    await api.put(`/admin/order/${orderId}`, updatedOrder.value);
    
    console.log(`Updated status for order ${orderId} to ${newStatus}`);
    
    // Show success message
    if (popupRef.value) {
      popupRef.value.show(`Order status updated to ${newStatus}`, "success");
    }
    
    // Refresh the orders after updating
    await fetchOrders();
  } catch (error) {
    console.error("Error updating order status:", error);
    if (popupRef.value) {
      popupRef.value.show("Failed to update order status", "error");
    }
  } finally {
    loading.value = false;
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