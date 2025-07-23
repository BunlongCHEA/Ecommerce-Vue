<template>
  <div v-if="isAdmin" class="min-h-screen w-full flex flex-col overflow-auto bg-white text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />
    
    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">
      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Dashboard'"
        :destination="'/admin/dashboard'"
        :defaultTitle="'Product Management'"
        :waitDuration="durationWait"
      ></BackButton>
      
      <!-- Main Content -->
      <div class="w-full bg-gray-50 p-6">
        <!-- Header with Buttons and Search Filters -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 class="text-2xl font-bold text-gray-800">Manage Products</h1>
          <div class="flex space-x-4">
            <button 
              @click="openExcelUploadModal"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              Upload Excel
            </button>
            <button 
              @click="handleAddProduct"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        <!-- Search and Filter Area -->
        <div class="bg-white shadow rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input 
                type="text" 
                id="searchQuery" 
                v-model="filters.searchQuery" 
                placeholder="Search products..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label for="categoryIds" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                id="categoryIds" 
                v-model="filters.categoryIds" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="minPrice" class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input 
                type="number" 
                id="minPrice" 
                v-model="filters.minPrice" 
                placeholder="Min price" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label for="maxPrice" class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input 
                type="number" 
                id="maxPrice" 
                v-model="filters.maxPrice" 
                placeholder="Max price" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div class="flex items-end">
              <button 
                @click="applyFilters" 
                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Products List -->
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex items-center">
                      Name
                      <button @click="sortBy('Name')" class="ml-1 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
                          <path d="M15 8a1 1 0 00-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex items-center">
                      Price
                      <button @click="sortBy('Price')" class="ml-1 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12z" />
                          <path d="M15 8a1 1 0 00-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        :src="product.imageUrl" 
                        :alt="product.name"
                        class="h-full w-full object-cover"
                        @error="handleImageError($event)"
                      />
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${{ formatPrice(product.price) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.categoryName }}</div>
                    <div class="text-xs text-gray-500">{{ product.subCategoryName }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.storeName }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="editProduct(product)"
                      class="text-indigo-600 hover:text-indigo-900 mx-2"
                    >
                      Edit
                    </button>
                    <button 
                      @click="confirmDelete(product)"
                      class="text-red-600 hover:text-red-900 mx-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                <!-- Empty state -->
                <tr v-if="products.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>No products available. Upload an Excel file or add a product to get started.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <PaginationOption
              v-model:currentPage="pagination.currentPage"
              v-model:itemsPerPage="pagination.pageSize"
              :totalItems="pagination.totalCount"
              :itemsPerPageOptions="[10, 20, 50, 100]"
              @update:currentPage="goToPage"
              @update:itemsPerPage="handlePageSizeChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Excel Upload Modal -->
    <!-- <div v-if="showExcelUploadModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-gray-900 bg-opacity-75" @click="showExcelUploadModal = false"></div>
      <div class="relative bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">Upload Product Excel File</h3>
            <button @click="showExcelUploadModal = false" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input 
              ref="fileInput"
              type="file" 
              accept=".xlsx, .xls" 
              @change="handleFileUpload" 
              class="hidden" 
            />
            <div v-if="!selectedFile">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="mt-4 text-sm text-gray-600">
                Drag and drop your Excel file here or
                <button 
                  type="button" 
                  @click="$refs.fileInput.click()" 
                  class="text-indigo-600 font-medium hover:text-indigo-500"
                >
                  browse
                </button>
              </p>
              <p class="mt-1 text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
            </div>
            <div v-else class="text-left">
              <div class="flex items-center justify-between bg-indigo-50 p-3 rounded-md">
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button @click="clearSelectedFile" class="text-gray-400 hover:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              @click="showExcelUploadModal = false"
              class="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="processExcelFile"
              :disabled="!selectedFile"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Excel Preview Modal -->
    <!-- <div v-if="showExcelPreviewModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-gray-900 bg-opacity-75" @click="showExcelPreviewModal = false"></div>
      <div class="relative bg-white rounded-lg max-w-6xl w-full mx-4 shadow-xl max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">Review Products</h3>
            <button @click="showExcelPreviewModal = false" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            Please review the imported products before adding them to your catalog.
          </p>
        </div>
        <div class="overflow-y-auto flex-1 p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SubCategory ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(product, index) in excelProducts" :key="index" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        :src="product.imageUrl" 
                        :alt="product.name"
                        class="h-full w-full object-cover"
                        @error="handleImageError($event)"
                      />
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${{ formatPrice(product.price) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 truncate max-w-[200px]">{{ product.description }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.categoryId }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.subCategoryId }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.storeId }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="editExcelProduct(index)"
                      class="text-indigo-600 hover:text-indigo-900 mx-2"
                    >
                      Edit
                    </button>
                    <button 
                      @click="removeExcelProduct(index)"
                      class="text-red-600 hover:text-red-900 mx-2"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Showing {{ excelProducts.length }} products from your Excel file.
          </div>
          <div class="flex">
            <button
              @click="showExcelPreviewModal = false"
              class="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="importProducts"
              :disabled="excelProducts.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {{ excelProducts.length }} Products
            </button>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Excel Upload Component -->
    <ExcelUploadComponent
      v-model="showExcelUploadModal"
      :upload-title="'Upload Product Excel File'"
      :preview-title="'Review Products'"
      :preview-description="'Please review the imported products before adding them to your catalog.'"
      :column-mapping="excelColumnMapping"
      :display-columns="excelDisplayColumns"
      :item-label="'Products'"
      :loading="excelLoading"
      @file-processed="handleFileProcessed"
      @item-edit="handleExcelItemEdit"
      @item-remove="handleExcelItemRemove"
      @data-import="handleDataImport"
      @upload-close="handleUploadClose"
      @preview-close="handlePreviewClose"
      ref="excelUploadRef"
    />

    <!-- Product Edit Modal -->
    <div v-if="showProductEditModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-gray-900 bg-opacity-75" @click="showProductEditModal = false"></div>
      <div class="relative bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingExistingProduct ? 'Edit Product' : 'Add New Product' }}
            </h3>
            <button @click="showProductEditModal = false" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="overflow-y-auto flex-1 p-6">
          <form @submit.prevent="saveProduct" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="currentEditProduct.name" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input 
                    type="number" 
                    id="price" 
                    v-model="currentEditProduct.price" 
                    class="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label for="categoryId" class="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  id="categoryId" 
                  v-model="currentEditProduct.categoryId" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option disabled :value="null">Select a category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="subCategoryId" class="block text-sm font-medium text-gray-700">Subcategory</label>
                <select 
                  id="subCategoryId" 
                  v-model="currentEditProduct.subCategoryId" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option disabled :value="null">Select a subcategory</option>
                  <option 
                    v-for="subcategory in filteredSubcategories" 
                    :key="subcategory.id" 
                    :value="subcategory.id"
                  >
                    {{ subcategory.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="storeId" class="block text-sm font-medium text-gray-700">Store</label>
                <select 
                  id="storeId" 
                  v-model="currentEditProduct.storeId" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option disabled :value="null">Select a store</option>
                  <option v-for="store in stores" :key="store.id" :value="store.id">
                    {{ store.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="couponId" class="block text-sm font-medium text-gray-700">Coupon (Optional)</label>
                <select 
                  id="couponId" 
                  v-model="currentEditProduct.couponId" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option :value="null">No coupon</option>
                  <option v-for="coupon in coupons" :key="coupon.id" :value="coupon.id">
                    {{ coupon.code }} ({{ coupon.discountPercentage }}% off)
                  </option>
                </select>
              </div>
            </div>
            
            <div>
              <label for="imageUrl" class="block text-sm font-medium text-gray-700">Image URL</label>
              <input 
                type="text" 
                id="imageUrl" 
                v-model="currentEditProduct.imageUrl" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              <div class="mt-2 flex items-center">
                <div v-if="currentEditProduct.imageUrl" class="h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                  <img 
                    :src="currentEditProduct.imageUrl" 
                    alt="Product preview"
                    class="h-full w-full object-cover"
                    @error="handleImageError($event)"
                  />
                </div>
                <span class="text-xs text-gray-500">Preview image will appear here</span>
              </div>
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                id="description" 
                v-model="currentEditProduct.description" 
                rows="4" 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="p-6 border-t bg-gray-50 flex justify-end">
          <button
            @click="showProductEditModal = false"
            class="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveProduct"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDelete
      v-model:show="showDeleteConfirmModal"
      :title="'Delete Product'"
      :message="`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`"
      :loading="deleteLoading"
      @confirm="deleteProduct"
      @cancel="cancelDeleteProduct"
    />

  </div>

  <!-- Forbidden Access -->
  <div v-else class="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
    <p class="text-lg font-bold text-red-500">403 - Forbidden: Admin Access Only</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
// import * as XLSX from 'xlsx';
import api from '@/services/api';

import LoadingOverlay from '@/components/LoadingOverlay.vue';
import PopupMessage from '@/components/PopupMessage.vue';
import BackButton from '@/components/BackButton.vue';
import HamburgerMenu from '@/components/HamburgerMenu.vue';
import ConfirmDelete from '@/components/ConfirmDelete.vue';
import PaginationOption from '@/components/PaginationOption.vue';
import ExcelUploadComponent from '@/components/ExcelUploadComponent.vue';
import { useFetchUserId } from "@/composables/useFetchUserId";

// Menu state
const isMenuOpen = ref(false);
const updateMenuState = (menuState) => {
  isMenuOpen.value = menuState;
};

// User authentication
const { userId, role, fetchUserId } = useFetchUserId();
const isAdmin = ref(false);

// State
const loading = ref(false);
const deleteLoading = ref(false);
const popupRef = ref(null);
const durationWait = 1000; // 1 second wait duration for animations

// Excel upload state
const excelLoading = ref(false);
const excelUploadRef = ref(null);

const products = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const stores = ref([]);
const coupons = ref([]);

// Pagination state
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0
});

// Filter state
const filters = ref({
  searchQuery: '',
  categoryIds: '',
  subCategoryIds: '',
  minPrice: null,
  maxPrice: null
});

// Modals
const showExcelUploadModal = ref(false);
// const showExcelPreviewModal = ref(false);
const showProductEditModal = ref(false);
const showDeleteConfirmModal = ref(false);

// File handling
// const selectedFile = ref(null);
// const excelProducts = ref([]);

// Product editing
const currentEditProduct = ref({
  id: null,
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  categoryId: null,
  subCategoryId: null,
  storeId: null,
  couponId: null
});

const editingExistingProduct = ref(false);
const editingExcelIndex = ref(null);
const productToDelete = ref(null);

// Excel configuration
const excelColumnMapping = {
  'Name': 'name',
  'Price': 'price',
  'Description': 'description',
  'ImageUrl': 'imageUrl',
  'CategoryId': 'categoryId',
  'SubCategoryId': 'subCategoryId',
  'StoreId': 'storeId',
  'CouponId': 'couponId'
};

const excelDisplayColumns = [
  { key: 'imageUrl', label: 'Image', type: 'image' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'price', label: 'Price', type: 'price' },
  { key: 'description', label: 'Description', type: 'text', wrapText: true, maxWidth: 'max-w-[200px]' },
  { key: 'categoryId', label: 'Category ID', type: 'text' },
  { key: 'subCategoryId', label: 'SubCategory ID', type: 'text' },
  { key: 'storeId', label: 'Store ID', type: 'text' }
];

const filteredSubcategories = computed(() => {
  console.log('Filtering subcategories for categoryId:', currentEditProduct.value.categoryId);
  console.log('Filtering subcategories for subcategoryId:', currentEditProduct.value.subCategoryId);
  return subcategories.value;
});

// Methods
const fetchProducts = async () => {
  loading.value = true;
  try {
    // Build query string for API request
    let queryParams = new URLSearchParams();
    queryParams.append('pageNumber', pagination.value.currentPage);
    queryParams.append('pageSize', pagination.value.pageSize);
    
    if (filters.value.searchQuery) {
      queryParams.append('searchQuery', filters.value.searchQuery);
    }
    
    if (filters.value.categoryIds) {
      queryParams.append('categoryIds', filters.value.categoryIds);
    }
    
    if (filters.value.subCategoryIds) {
      queryParams.append('subCategoryIds', filters.value.subCategoryIds);
    }
    
    if (filters.value.minPrice) {
      queryParams.append('minPrice', filters.value.minPrice);
    }
    
    if (filters.value.maxPrice) {
      queryParams.append('maxPrice', filters.value.maxPrice);
    }
    
    const response = await api.get(`/admin/product?${queryParams.toString()}`);
    
    // Update the products array and pagination info
    if (response.data && response.data.products) {
      products.value = response.data.products;
      pagination.value = {
        currentPage: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages
      };
      console.log('Products fetched:', products.value);
    } else {
      products.value = [];
      popupRef.value.show('Product data format is incorrect.', 'warning');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    popupRef.value.show('Failed to fetch products. Please try again later.', 'error');
    products.value = []; 
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/category');
    categories.value = response.data.map(category => ({
      id: category.id,
      name: category.name,
    }));
    console.log('Categories fetched:', categories.value);
  } catch (error) {
    console.error('Error fetching categories:', error);
    popupRef.value.show('Failed to load categories.', 'error');
    categories.value = [];
  }
};

const fetchSubcategories = async () => {
  try {
    const response = await api.get('/subcategory');
    subcategories.value = response.data.map(subcategory => ({
      id: subcategory.id,
      name: subcategory.name,
    }));
    console.log('Subcategories fetched:', subcategories.value);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    popupRef.value.show('Failed to load subcategories.', 'error');
    subcategories.value = [];
  }
};

const fetchStores = async () => {
  try {
    const response = await api.get('/store');
    stores.value = response.data.map(store => ({
      id: store.id,
      name: store.name,
    }));
  } catch (error) {
    console.error('Error fetching stores:', error);
    popupRef.value.show('Failed to load stores.', 'error');
    stores.value = [];
  }
};

const fetchCoupons = async () => {
  try {
    const response = await api.get('/coupon');
    coupons.value = response.data
      .filter(coupon => coupon.isActive && coupon.type === "Store") // Only active coupons
      .map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
      }));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    popupRef.value.show('Failed to load coupons.', 'error');
    coupons.value = [];
  }
};

// Pagination controls
const handlePageSizeChange = () => {
  pagination.value.currentPage = 1; // Reset to first page when changing page size
  fetchProducts();
};

const goToPage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.currentPage = page;
  fetchProducts();
};

// Filter controls
const applyFilters = () => {
  pagination.value.currentPage = 1; // Reset to first page when applying filters
  fetchProducts();
};

const openExcelUploadModal = () => {
  showExcelUploadModal.value = true;
};

const handleFileProcessed = (data, error) => {
  if (error) {
    popupRef.value.show('Error processing Excel file. Please check the format.', 'error');
  } else {
    console.log('Excel data processed:', data);
  }
};

const handleExcelItemEdit = (index, item) => {
  editingExcelIndex.value = index;
  currentEditProduct.value = { ...item };
  showProductEditModal.value = true;
};

const handleExcelItemRemove = (index) => {
  // Item already removed in the component
  console.log('Item removed at index:', index);
};

const handleDataImport = async (data) => {
  excelLoading.value = true;
  try {
    const response = await api.post('/admin/product/batch', data);
    
    // Refresh the products list
    await fetchProducts();
    
    // Clear the Excel data
    excelUploadRef.value?.clearData();
    
    popupRef.value.show('Products imported successfully!', 'success');
  } catch (error) {
    console.error('Error importing products:', error);
    popupRef.value.show('Error importing products. Please try again.', 'error');
  } finally {
    excelLoading.value = false;
  }
};

const handleUploadClose = () => {
  showExcelUploadModal.value = false;
};

const handlePreviewClose = () => {
  // Excel component handles its own preview modal
};

// const handleFileUpload = (event) => {
//   const file = event.target.files[0];
//   if (!file) return;
//   selectedFile.value = file;
// };

// const clearSelectedFile = () => {
//   selectedFile.value = null;
//   if (this.$refs.fileInput) {
//     this.$refs.fileInput.value = '';
//   }
// };

// const processExcelFile = async () => {
//   if (!selectedFile.value) return;

//   loading.value = true;
//   try {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });
      
//       // Assuming the first sheet contains our data
//       const worksheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[worksheetName];
      
//       // Convert to JSON
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
//       // Map Excel data to our product model
//       excelProducts.value = jsonData.map(row => ({
//         name: row.Name || '',
//         price: parseFloat(row.Price) || 0,
//         description: row.Description || '',
//         imageUrl: row.ImageUrl || 'https://via.placeholder.com/150',
//         categoryId: parseInt(row.CategoryId) || null,
//         subCategoryId: parseInt(row.SubCategoryId) || null,
//         storeId: parseInt(row.StoreId) || null,
//         couponId: row.CouponId ? parseInt(row.CouponId) : null
//       }));
      
//       showExcelUploadModal.value = false;
//       showExcelPreviewModal.value = true;
//     };
//     reader.readAsArrayBuffer(selectedFile.value);
//   } catch (error) {
//     console.error('Error processing Excel file:', error);
//     popupRef.value.show('Error processing Excel file. Please check the format.', 'error');
//   } finally {
//     loading.value = false;
//   }
// };

// const formatFileSize = (bytes) => {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// };

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// const editExcelProduct = (index) => {
//   editingExcelIndex.value = index;
//   currentEditProduct.value = { ...excelProducts.value[index] };
//   showExcelPreviewModal.value = false;
//   showProductEditModal.value = true;
// };

// const removeExcelProduct = (index) => {
//   excelProducts.value.splice(index, 1);
// };

// const importProducts = async () => {
//   loading.value = true;
//   try {
//     // In a real application, you would send the products to your API
//     const response = await api.post('/admin/product/batch', excelProducts.value);
    
//     // Refresh the products list
//     await fetchProducts();
    
//     // Clear the Excel product data
//     excelProducts.value = [];
//     selectedFile.value = null;
//     showExcelPreviewModal.value = false;
    
//     popupRef.value.show('Products imported successfully!', 'success');
//   } catch (error) {
//     console.error('Error importing products:', error);
//     popupRef.value.show('Error importing products. Please try again.', 'error');
//   } finally {
//     loading.value = false;
//   }
// };

const handleAddProduct = () => {
  editingExistingProduct.value = false;
  editingExcelIndex.value = null;
  currentEditProduct.value = {
    id: null,
    name: '',
    price: 0,
    description: '',
    imageUrl: '',
    categoryId: null,
    subCategoryId: null,
    storeId: null,
    couponId: null
  };
  showProductEditModal.value = true;
};

const editProduct = (product) => {
  editingExistingProduct.value = true;
  editingExcelIndex.value = null;
  currentEditProduct.value = { ...product };
  showProductEditModal.value = true;
};

const saveProduct = async () => {
  loading.value = true;
  try {
    if (editingExcelIndex.value !== null) {
      // We're editing an Excel product before import
      excelProducts.value[editingExcelIndex.value] = { ...currentEditProduct.value };
      editingExcelIndex.value = null;
      showProductEditModal.value = false;
      // showExcelPreviewModal.value = true;
      excelUploadRef.value?.showPreview();
      popupRef.value.show('Product updated in preview.', 'success');
    } else if (editingExistingProduct.value) {
      // We're editing an existing product
      const response = await api.put(`/admin/product/${currentEditProduct.value.id}`, {
        name: currentEditProduct.value.name,
        price: currentEditProduct.value.price,
        description: currentEditProduct.value.description,
        imageUrl: currentEditProduct.value.imageUrl,
        categoryId: currentEditProduct.value.categoryId,
        subCategoryId: currentEditProduct.value.subCategoryId,
        storeId: currentEditProduct.value.storeId,
        couponId: currentEditProduct.value.couponId || null
      });
      
      // Refresh products to show updated data
      await fetchProducts();
      
      showProductEditModal.value = false;
      popupRef.value.show('Product updated successfully!', 'success');
    } else {
      // We're adding a new product
      const response = await api.post('/admin/product', {
        name: currentEditProduct.value.name,
        price: currentEditProduct.value.price,
        description: currentEditProduct.value.description,
        imageUrl: currentEditProduct.value.imageUrl,
        categoryId: currentEditProduct.value.categoryId,
        subCategoryId: currentEditProduct.value.subCategoryId,
        storeId: currentEditProduct.value.storeId,
        couponId: currentEditProduct.value.couponId || null
      });
      
      // Refresh products to include the new one
      await fetchProducts();
      
      showProductEditModal.value = false;
      popupRef.value.show('Product added successfully!', 'success');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    popupRef.value.show(`Error saving product: ${error.response?.data || error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteConfirmModal.value = true;
};

const cancelDeleteProduct = () => {
  productToDelete.value = null;
};

const deleteProduct = async () => {
  if (!productToDelete.value) return;
  
  deleteLoading.value = true;
  try {
    await api.delete(`/admin/product/${productToDelete.value.id}`);
    
    // Refresh the products list
    await fetchProducts();
    
    showDeleteConfirmModal.value = false;
    popupRef.value.show('Product deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting product:', error);
    popupRef.value.show('Error deleting product. Please try again.', 'error');
  } finally {
    deleteLoading.value = false;
    productToDelete.value = null;
  }
};

const sortBy = (field) => {
  // Note: Server-side sorting would be implemented here in a production app
  // For client-side sorting, you could use:
  products.value = [...products.value].sort((a, b) => {
    if (a[field.toLowerCase()] < b[field.toLowerCase()]) return -1;
    if (a[field.toLowerCase()] > b[field.toLowerCase()]) return 1;
    return 0;
  });
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150?text=No+Image';
};

// Initialize component
onMounted(async () => {
  try {
    await fetchUserId();
    isAdmin.value = role.value === "Admin";
    if (isAdmin.value) {
      loading.value = true;
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSubcategories(),
        fetchStores(),
        fetchCoupons()
      ]);
    }
  } catch (error) {
    console.error('Error initializing component:', error);
    popupRef.value.show('Failed to load data. Please refresh the page.', 'error');
  } finally {
    loading.value = false;
  }
});
</script>