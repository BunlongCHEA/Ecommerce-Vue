<template>
  <div v-if="isAdmin" class="min-h-screen w-full flex flex-col overflow-auto bg-white text-gray-800">
    <LoadingOverlay :show="loading" />
    <PopupMessage ref="popupRef" />
    
    <HamburgerMenu @menu-toggle="updateMenuState" />

    <div class="w-full transform transition-transform duration-500"
         :class="{ 'translate-x-64': isMenuOpen }">
      <!-- Back Button & Title Component -->
      <BackButton
        :buttonLabel="'Back to Product'"
        :destination="'/product'"
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
                        :src="getImageSrc(product.imageUrl)" 
                        :alt="product.name"
                        class="h-full w-full object-cover"
                        @error="handleImageError($event)"
                        @load="handleImageLoad($event)"
                        loading="lazy"
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

    <!-- Excel Upload Component -->
    <ExcelUpload
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
      @sample-download="handleSampleDownload"
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
                <label for="eventId" class="block text-sm font-medium text-gray-700">Event Campaign</label>
                <select 
                  id="eventId" 
                  v-model="currentEditProduct.eventId" 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option disabled :value="null">Select a event campaign</option>
                  <option v-for="event in events" :key="event.id" :value="event.id">
                    {{ event.name }}
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
            
            <!-- <div>
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
            </div> -->

            <!-- IMAGE UPLOAD SECTION -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Product Image</label>
              
              <!-- Image Upload Method Selection -->
              <div class="flex space-x-4 mb-4">
                <label class="flex items-center">
                  <input 
                    type="radio" 
                    v-model="imageUploadMethod" 
                    value="url"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">Image URL</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="radio" 
                    v-model="imageUploadMethod" 
                    value="file"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">Upload File</span>
                </label>
              </div>

              <!-- URL Input Method -->
              <div v-if="imageUploadMethod === 'url'" class="space-y-3">
                <input 
                  type="url" 
                  v-model="currentEditProduct.imageUrl" 
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                <!-- URL Preview -->
                <div v-if="currentEditProduct.imageUrl" class="flex items-center">
                  <div class="h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                    <img 
                      :src="getImageSrc(currentEditProduct.imageUrl)" 
                      alt="Preview" 
                      class="h-full w-full object-cover"
                      @error="handleImageError($event)"
                      @load="handleImageLoad($event)"
                      loading="lazy"
                    />
                  </div>
                  <span class="text-xs text-gray-500">URL Preview</span>
                </div>
              </div>

              <!-- File Upload Method -->
              <div v-if="imageUploadMethod === 'file'" class="space-y-3">
                <!-- File Input -->
                <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input 
                      ref="fileInput"
                      type="file" 
                      class="hidden" 
                      accept="image/*"
                      @change="handleFileSelect"
                    >
                  </label>
                </div>

                <!-- File Upload Progress -->
                <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
                </div>

                <!-- Selected File Preview -->
                <div v-if="selectedFile" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <img 
                    :src="filePreviewUrl" 
                    alt="Preview" 
                    class="w-16 h-16 object-cover rounded-md"
                  >
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                  <button 
                    type="button"
                    @click="removeSelectedFile"
                    class="text-red-600 hover:text-red-800"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <!-- Current Image (for edit mode) -->
                <div v-if="editingExistingProduct && currentEditProduct.imageUrl && !selectedFile" class="space-y-2">
                  <p class="text-sm text-gray-600">Current Image:</p>
                  <div class="flex items-center space-x-3">
                    <img 
                      :src="currentEditProduct.imageUrl" 
                      alt="Current product image" 
                      class="w-16 h-16 object-cover rounded-md border"
                    >
                    <span class="text-xs text-gray-500">Keep current image or upload new one</span>
                  </div>
                </div>
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
import ExcelUpload from '@/components/ExcelUpload.vue';
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
const defaultImage = 'https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-thumbnail-graphic-illustration-vector-png-image_40966590.jpg';

const products = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const stores = ref([]);
const coupons = ref([]);
const events = ref([]);

// Add these to your existing data/setup
const imageUploadMethod = ref('url') // 'url' or 'file'
const selectedFile = ref(null)
const filePreviewUrl = ref('')
const uploadProgress = ref(0)

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
  couponId: null,
  eventId: null
});

// Excel data
const editingExistingProduct = ref(false);
const editingExcelIndex = ref(null);
const excelProducts = ref([]);
const productToDelete = ref(null);

// Excel upload state
const excelLoading = ref(false);
const excelUploadRef = ref(null);

const showExcelUploadModal = ref(false);
const showProductEditModal = ref(false);
const showDeleteConfirmModal = ref(false);

// Excel configuration
const excelColumnMapping = {
  'Name': 'name',
  'Price': 'price',
  'Description': 'description',
  'ImageUrl': 'imageUrl',
  'CategoryId': 'categoryId',
  'SubCategoryId': 'subCategoryId',
  'StoreId': 'storeId',
  'CouponId': 'couponId',
  'EventId': 'eventId'
};

const excelDisplayColumns = [
  { key: 'imageUrl', label: 'Image', type: 'image' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'price', label: 'Price', type: 'price' },
  { key: 'description', label: 'Description', type: 'text', wrapText: true, maxWidth: 'max-w-[200px]' },
  { key: 'categoryId', label: 'Category ID', type: 'text' },
  { key: 'subCategoryId', label: 'SubCategory ID', type: 'text' },
  { key: 'storeId', label: 'Store ID', type: 'text' },
  { key: 'couponId', label: 'Coupon ID', type: 'text' },
  { key: 'eventId', label: 'Event ID', type: 'text' }
];

const filteredSubcategories = computed(() => {
  console.log('Filtering subcategories for categoryId:', currentEditProduct.value.categoryId);
  console.log('Filtering subcategories for subcategoryId:', currentEditProduct.value.subCategoryId);
  return subcategories.value;
});

// --- Methods ---
// --- FormData Helper Functions ---

const createFormData = async () => {
  const productData = {
    name: currentEditProduct.value.name,
    price: parseFloat(currentEditProduct.value.price),
    description: currentEditProduct.value.description || '',
    categoryId: parseInt(currentEditProduct.value.categoryId),
    storeId: parseInt(currentEditProduct.value.storeId),
    subCategoryId: currentEditProduct.value.subCategoryId ? parseInt(currentEditProduct.value.subCategoryId) : null,
    eventId: currentEditProduct.value.eventId ? parseInt(currentEditProduct.value.eventId) : null,
    couponId: currentEditProduct.value.couponId ? parseInt(currentEditProduct.value.couponId) : null
  };

  // Handle image based on upload method
  if (imageUploadMethod.value === 'file' && selectedFile.value) {
    // File upload method - convert to base64
    try {
      const base64 = await fileToBase64(selectedFile.value);
      productData.imageBase64 = base64;
      productData.imageFileName = selectedFile.value.name;
      productData.imageContentType = selectedFile.value.type;
      console.log(`Converted file to base64: ${selectedFile.value.name} (${selectedFile.value.size} bytes)`);
    } catch (error) {
      console.error('Error converting file to base64:', error);
      popupRef.value?.show('Error processing image file', 'error');
    }
  } else if (imageUploadMethod.value === 'url' && currentEditProduct.value.imageUrl) {
    try {
      // Validate URL first
      if (!isValidImageUrl(currentEditProduct.value.imageUrl)) {
        throw new Error('Invalid image URL format');
      }

      popupRef.value?.show('Downloading image from URL...', 'info');
      
      const imageData = await downloadImageFromUrl(
        currentEditProduct.value.imageUrl, 
        currentEditProduct.value.name || 'product'
      );

      if (imageData) {
        productData.imageBase64 = imageData.base64;
        productData.imageFileName = imageData.fileName;
        productData.imageContentType = imageData.contentType;
        console.log(`Downloaded and converted image: ${imageData.fileName}`);
        popupRef.value?.show('Image downloaded successfully', 'success');
      } else {
        console.warn('Failed to download image, proceeding without image');
        popupRef.value?.show('Warning: Could not download image from URL', 'warning');
      }
    } catch (error) {
      console.error('Error downloading image from URL:', error);
      popupRef.value?.show(`Error downloading image: ${error.message}`, 'error');
    }
  }
  
  return productData;
}

const resetFileUpload = () => {
  selectedFile.value = null;
  filePreviewUrl.value = '';
  uploadProgress.value = 0;
  imageUploadMethod.value = 'url';
};

// --- API Calls ---

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

const fetchEvents = async () => {
  try {
    const response = await api.get('/event');
    events.value = response.data.map(event => ({
      id: event.id,
      name: event.name,
      // imageUrl: event.imageUrl,
      // startDate: event.startDate,
      // endDate: event.endDate,
      // description: event.description
    }));
    console.log('Events fetched:', events.value);
  } catch (error) {
    console.error('Error fetching events:', error);
    popupRef.value.show('Failed to load events.', 'error');
    events.value = [];
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


//  --- Handle Page Load ---

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


// --- Handle Excel Upload ---

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
  // currentEditProduct.value = { ...item };
  
  // Create a deep copy to avoid reference issues
  currentEditProduct.value = JSON.parse(JSON.stringify(item));
  showProductEditModal.value = true;
};

const handleExcelItemRemove = (index) => {
  // Item already removed in the component
  console.log('Item removed at index:', index);
};

const handleDataImport = async (data) => {
  excelLoading.value = true;
  uploadProgress.value = 0;

  try {
    // Show progress for image downloads
    popupRef.value.show('Downloading images...', 'success');
    
    // Download all images first with progress tracking
    const productsWithFiles = await downloadImagesWithProgress(data, (progress) => {
      uploadProgress.value = Math.round(progress * 0.5); // First 50% for downloads
    });

    // Prepare products data (without image files)
    const productsData = productsWithFiles.map(product => ({
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      categoryId: parseInt(product.categoryId),
      subCategoryId: parseInt(product.subCategoryId),
      storeId: parseInt(product.storeId),
      couponId: product.couponId ? parseInt(product.couponId) : null,
      eventId: product.eventId ? parseInt(product.eventId) : null,
      imageBase64: product.imageBase64 || null,
      imageFileName: product.imageFileName || null,
      imageContentType: product.imageContentType || null
    }));

    console.log(`Prepared ${productsData.length} products for upload`);

    // Upload to backend
    popupRef.value.show('Uploading products...', 'success');

    const response = await api.post('/admin/product/batch', productsData, {
      headers: {
        'Content-Type': 'application/json'
      },
      onUploadProgress: (progressEvent) => {
        // uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Second 50% for upload
        const uploadPercentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        uploadProgress.value = 50 + Math.round(uploadPercentage * 0.5);
      }
    });
    
    // Refresh the products list
    await fetchProducts();
    
    // Clear the Excel data
    excelUploadRef.value?.clearData();

    uploadProgress.value = 100;
    popupRef.value.show('Products imported successfully!', 'success');
  } catch (error) {
    console.error('Error importing products:', error);
    popupRef.value.show('Error importing products. Please try again.', 'error');
  } finally {
    excelLoading.value = false;
    uploadProgress.value = 0;
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Helper function to download images from URLs and convert to base64
const downloadImageFromUrl = async (imageUrl, productName) => {
  try {
    // Skip if URL is empty or is already a data URL (base64)
    if (!imageUrl || imageUrl.startsWith('data:')) {
      return imageUrl.startsWith('data:') ? {
        base64: imageUrl,
        fileName: `${productName}.jpg`,
        contentType: imageUrl.split(';')[0].split(':')[1] || 'image/jpeg'
      } : null;
    }

    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedProductName = productName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      mode: 'cors',
      headers: {
        'Accept': 'image/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Validate that it's actually an image
    if (!blob.type.startsWith('image/')) {
      throw new Error(`Invalid content type: ${blob.type}`);
    }
    
    // Determine file extension from content type
    let extension = 'jpg'; // default
    if (blob.type.includes('png')) extension = 'png';
    else if (blob.type.includes('gif')) extension = 'gif';
    else if (blob.type.includes('webp')) extension = 'webp';
    else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) extension = 'jpg';
    
    // Create filename
    const filename = `${sanitizedProductName}_${timestamp}.${extension}`;
    
    // Convert blob to base64
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
    console.log(`Successfully downloaded and converted image: ${filename} (${blob.size} bytes)`);
    
    return {
      base64: base64,
      fileName: filename,
      contentType: blob.type
    };
    
  } catch (error) {
    console.error(`Error downloading image from ${imageUrl}:`, error);
    throw error;
  }
};

// Helper function to validate image URLs
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a data URL (base64)
  if (url.startsWith('data:image/')) return true;
  
  // Check if it's a valid HTTP/HTTPS URL
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper function to download multiple images with progress tracking
const downloadImagesWithProgress = async (products, onProgress) => {
  const results = [];
  const total = products.length;
  
  for (let i = 0; i < total; i++) {
    const product = products[i];
    const productData = { ...product };
    
    try {
      if (product.imageUrl && isValidImageUrl(product.imageUrl)) {
        const imageData = await downloadImageFromUrl(product.imageUrl, product.name || `product_${i}`);
        
        if (imageData) {
          productData.imageBase64 = imageData.base64;
          productData.imageFileName = imageData.fileName;
          productData.imageContentType = imageData.contentType;
          console.log(`Downloaded image for product ${i + 1}/${total}: ${product.name}`);
        }
      }
    } catch (error) {
      console.error(`Failed to download image for product ${product.name}:`, error);
      // Continue without image for this product
    }
    
    results.push(productData);
    
    // Report progress
    if (onProgress) {
      onProgress((i + 1) / total);
    }
  }
  
  return results;
};

const handleUploadClose = () => {
  showExcelUploadModal.value = false;
};

const handlePreviewClose = () => {
  // Excel component handles its own preview modal
};

// Download sample file
const handleSampleDownload = (format, data) => {
  console.log(`Sample ${format} file downloaded with ${data.length} rows`);
  // Optional: Track download analytics
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// --- Image Files Upload Handlers in jpeg, jpg, png, gif, webp ---

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Please select a valid image file (JPEG, PNG, GIF, WebP)')
    return
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert('File size must be less than 5MB')
    return
  }

  // Set selected file
  selectedFile.value = file
  
  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    filePreviewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeSelectedFile = () => {
  selectedFile.value = null
  filePreviewUrl.value = ''
  uploadProgress.value = 0
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleImageError = (event) => {
  // Prevent infinite loop by checking if we're already showing fallback
  if (event.target.dataset.fallback !== 'true') {
    event.target.dataset.fallback = 'true';
    event.target.src = defaultImage;
    event.target.alt = 'No Image Available';
  }
};

// Return default image if URL is empty or invalid
const getImageSrc = (imageUrl) => {
  if (!imageUrl || imageUrl.trim() === '') {
    return defaultImage;
  }
  return imageUrl;
};

const handleImageLoad = (event) => {
  // Reset fallback flag when image loads successfully
  event.target.dataset.fallback = 'false';
};

// --- Product Add/Edit/Delete ---

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
    eventId: null,
    subCategoryId: null,
    storeId: null,
    couponId: null
  };
  resetFileUpload();
  showProductEditModal.value = true;
};

const editProduct = (product) => {
  editingExistingProduct.value = true;
  editingExcelIndex.value = null;
  currentEditProduct.value = { ...product };
  resetFileUpload();
  // If editing and there's an existing image URL, default to URL method
  if (product.imageUrl) {
    imageUploadMethod.value = 'url';
  }
  showProductEditModal.value = true;
};

const saveProduct = async () => {
  loading.value = true;
  try {
    if (editingExcelIndex.value !== null) {
      // Get current data from Excel component
      const currentData = excelUploadRef.value?.getData() || [];

      if (editingExcelIndex.value < currentData.length) {
        // Update the specific item
        currentData[editingExcelIndex.value] = { ...currentEditProduct.value };
        
        // Set the updated data back to the Excel component
        excelUploadRef.value?.setData(currentData);
        
        console.log('Successfully updated Excel product:', currentEditProduct.value);
      }

      // We're editing an Excel product before import
      // excelProducts.value[editingExcelIndex.value] = { ...currentEditProduct.value };
      
      editingExcelIndex.value = null;
      showProductEditModal.value = false;
      excelUploadRef.value?.showPreview();
      popupRef.value.show('Product updated in preview.', 'success');
    } else if (editingExistingProduct.value) {
      // We're editing an existing product
      // const formData = createFormData();
      const productData = await createFormData();
      
      const response = await api.put(`/admin/product/${currentEditProduct.value.id}`, productData, {
        headers: {
          'Content-Type': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      });
      
      await fetchProducts();
      showProductEditModal.value = false;
      resetFileUpload();
      popupRef.value.show('Product updated successfully!', 'success');
    } else {
      // We're adding a new product
      // const formData = createFormData();
      const productData = await createFormData();
      
      const response = await api.post('/admin/product', productData, {
        headers: {
          'Content-Type': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      });
      
      await fetchProducts();
      showProductEditModal.value = false;
      resetFileUpload();
      popupRef.value.show('Product added successfully!', 'success');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    popupRef.value.show(`Error saving product: ${error.response?.data?.message || error.message}`, 'error');
  } finally {
    loading.value = false;
    uploadProgress.value = 0;
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


// --- Watchers & OnMounted ---

// Watch for image upload method changes
watch(imageUploadMethod, (newMethod) => {
  if (newMethod === 'file') {
    // Clear URL when switching to file
    currentEditProduct.value.imageUrl = '';
  } else if (newMethod === 'url') {
    // Clear file when switching to URL
    removeSelectedFile();
  }
});

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
        fetchEvents(),
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