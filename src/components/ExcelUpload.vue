<template>
  <div>
    <!-- Excel Upload Modal -->
    <div v-if="showExcelUploadModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-gray-900 bg-opacity-75" @click="closeUploadModal"></div>
      <div class="relative bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">{{ uploadTitle }}</h3>
            <button @click="closeUploadModal" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input 
              ref="fileInput"
              type="file" 
              :accept="acceptedFileTypes" 
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
              <p class="mt-1 text-xs text-gray-500">{{ fileTypeDescription }}</p>
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
              @click="closeUploadModal"
              class="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="processExcelFile"
              :disabled="!selectedFile || loading"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Excel Preview Modal -->
    <div v-if="showExcelPreviewModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-gray-900 bg-opacity-75" @click="closePreviewModal"></div>
      <div class="relative bg-white rounded-lg max-w-6xl w-full mx-4 shadow-xl max-h-[90vh] flex flex-col">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">{{ previewTitle }}</h3>
            <button @click="closePreviewModal" class="text-gray-400 hover:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            {{ previewDescription }}
          </p>
        </div>
        <div class="overflow-y-auto flex-1 p-4">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th 
                    v-for="column in displayColumns" 
                    :key="column.key"
                    scope="col" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ column.label }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, index) in excelData" :key="index" class="hover:bg-gray-50">
                  <td 
                    v-for="column in displayColumns" 
                    :key="column.key"
                    class="px-6 py-4"
                    :class="column.wrapText ? '' : 'whitespace-nowrap'"
                  >
                    <div v-if="column.type === 'image'" class="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        :src="item[column.key]" 
                        :alt="item.name || 'Image'"
                        class="h-full w-full object-cover"
                        @error="handleImageError($event)"
                      />
                    </div>
                    <div v-else-if="column.type === 'price'" class="text-sm text-gray-900">
                      ${{ formatPrice(item[column.key]) }}
                    </div>
                    <div v-else class="text-sm text-gray-900" :class="column.maxWidth ? `truncate ${column.maxWidth}` : ''">
                      {{ item[column.key] }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      @click="editItem(index)"
                      class="text-indigo-600 hover:text-indigo-900 mx-2"
                    >
                      Edit
                    </button>
                    <button 
                      @click="removeItem(index)"
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
            Showing {{ excelData.length }} items from your Excel file.
          </div>
          <div class="flex">
            <button
              @click="closePreviewModal"
              class="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="importData"
              :disabled="excelData.length === 0 || loading"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </span>
              <span v-else>Import {{ excelData.length }} {{ itemLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  uploadTitle: {
    type: String,
    default: 'Upload Excel File'
  },
  previewTitle: {
    type: String,
    default: 'Review Data'
  },
  previewDescription: {
    type: String,
    default: 'Please review the imported data before proceeding.'
  },
  acceptedFileTypes: {
    type: String,
    default: '.xlsx, .xls'
  },
  fileTypeDescription: {
    type: String,
    default: 'Excel files only (.xlsx, .xls)'
  },
  columnMapping: {
    type: Object,
    required: true,
    // Example: { Name: 'name', Price: 'price', Description: 'description' }
  },
  displayColumns: {
    type: Array,
    required: true,
    // Example: [
    //   { key: 'imageUrl', label: 'Image', type: 'image' },
    //   { key: 'name', label: 'Name', type: 'text' },
    //   { key: 'price', label: 'Price', type: 'price' }
    // ]
  },
  itemLabel: {
    type: String,
    default: 'Items'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'file-processed',
  'item-edit',
  'item-remove',
  'data-import',
  'upload-close',
  'preview-close'
]);

// State
const showExcelUploadModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const showExcelPreviewModal = ref(false);
const selectedFile = ref(null);
const excelData = ref([]);

// Methods
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  selectedFile.value = file;
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  if (this.$refs?.fileInput) {
    this.$refs.fileInput.value = '';
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150?text=No+Image';
};

const processExcelFile = async () => {
  if (!selectedFile.value) return;

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Assuming the first sheet contains our data
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Map Excel data using the provided column mapping
      excelData.value = jsonData.map(row => {
        const mappedItem = {};
        
        Object.entries(props.columnMapping).forEach(([excelColumn, propertyName]) => {
          let value = row[excelColumn];
          
          // Handle different data types
          if (propertyName.includes('Id') || propertyName === 'price') {
            value = value ? parseFloat(value) || null : null;
          } else if (propertyName === 'imageUrl' && !value) {
            value = 'https://via.placeholder.com/150';
          }
          
          mappedItem[propertyName] = value || (propertyName === 'price' ? 0 : '');
        });
        
        return mappedItem;
      });
      
      showExcelUploadModal.value = false;
      showExcelPreviewModal.value = true;
      
      emit('file-processed', excelData.value);
    };
    reader.readAsArrayBuffer(selectedFile.value);
  } catch (error) {
    console.error('Error processing Excel file:', error);
    emit('file-processed', null, error);
  }
};

const editItem = (index) => {
  emit('item-edit', index, excelData.value[index]);
};

const removeItem = (index) => {
  excelData.value.splice(index, 1);
  emit('item-remove', index);
};

const importData = () => {
  emit('data-import', excelData.value);
};

const closeUploadModal = () => {
  showExcelUploadModal.value = false;
  selectedFile.value = null;
  emit('upload-close');
};

const closePreviewModal = () => {
  showExcelPreviewModal.value = false;
  emit('preview-close');
};

// Expose methods for parent component
defineExpose({
  clearData: () => {
    excelData.value = [];
    selectedFile.value = null;
  },
  updateItem: (index, updatedItem) => {
    if (index >= 0 && index < excelData.value.length) {
      excelData.value[index] = updatedItem;
    }
  },
  showPreview: () => {
    showExcelPreviewModal.value = true;
  },
  hidePreview: () => {
    showExcelPreviewModal.value = false;
  }
});
</script>