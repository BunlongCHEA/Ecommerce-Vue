<template>
  <!-- Small Debug Info -->
  <!-- <div v-if="isAuthenticated" class="fixed top-4 left-4 z-50 bg-black text-white p-2 text-xs rounded">
    <div>Chat Open: {{ isOpen ? 'Yes' : 'No' }}</div>
    <div>Should Show: {{ shouldShowChat ? 'Yes' : 'No' }}</div>
    <div>Route: {{ route.name || route.path }}</div>
    <div>User ID: {{ userId }}</div>
  </div> -->

  <!-- Debug Toggle Button -->
  <!-- <button 
    v-if="isAuthenticated"
    @click="showDebug = !showDebug" 
    class="fixed bottom-4 left-4 z-50 bg-red-600 text-white px-2 py-1 rounded text-xs"
  >
    Debug
  </button> -->

  <!-- Chat Widget - Only show on allowed pages -->
  <div v-if="shouldShowChat" class="fixed bottom-4 right-4 z-50">
    <!-- Chat Button (when minimized) -->
    <button
      v-if="!isOpen"
      @click="openChat"
      class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z"></path>
      </svg>
      <!-- Unread Messages Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col overflow-hidden"
    >
      <!-- Chat Header -->
      <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 class="font-semibold">
            {{ currentUserRole === 'Admin' ? 'Admin Support' : 'Support Chat' }}
          </h3>
          <p class="text-sm opacity-90">
            {{ currentUserRole === 'Admin' && selectedRoom ? selectedRoom.customerName : 
              isConnected ? 'Connected to support' : 'Connecting...' }}
          </p>
        </div>
        <div class="flex gap-2">
          <!-- Show rooms list button for admin -->
          <button
            v-if="currentUserRole === 'Admin'"
            @click="toggleRoomsList"
            class="text-white hover:bg-blue-700 rounded p-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <button
            @click="minimizeChat"
            class="text-white hover:bg-blue-700 rounded p-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <button
            @click="closeChat"
            class="text-white hover:bg-blue-700 rounded p-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Admin Rooms List -->
      <div v-if="currentUserRole === 'Admin' && showRoomsList" class="flex-1 overflow-y-auto p-4 bg-gray-50">
        <h4 class="font-semibold mb-3">Support Conversations</h4>
        <div v-if="adminRooms.length === 0" class="text-center text-gray-500 py-8">
          <p class="text-sm">No support conversations yet</p>
        </div>
        <div
          v-for="room in adminRooms"
          :key="room.id"
          @click="selectRoom(room)"
          class="p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-sm">{{ room.customerName }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ room.lastMessage || 'No messages yet' }}</p>
            </div>
            <div class="text-right">
              <span v-if="room.unreadCount > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {{ room.unreadCount }}
              </span>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(room.lastActivity) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Area (for both admin and user) -->
      <div
        v-else
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 relative"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        :class="{ 'bg-blue-50 border-2 border-dashed border-blue-300': isDragOver }"
      >
        <!-- Drag & Drop Overlay -->
        <div
          v-if="isDragOver"
          class="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10"
        >
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="text-blue-600 font-medium">Drop image here to send</p>
          </div>
        </div>

        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.964L3 20l1.036-5.874A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z"></path>
          </svg>
          <p class="text-sm">
            {{ currentUserRole === 'Admin' ? 'Select a conversation to start chatting' : 'Hi there! 👋' }}
          </p>
          <p v-if="currentUserRole !== 'Admin'" class="text-sm mt-1">How can we help you today?</p>
        </div>

        <!-- Messages -->
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.senderId === currentUserId ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              message.senderId === currentUserId
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
            ]"
          >
            <!-- Image Display -->
            <div v-if="message.imageId && message.imageUrl" class="mb-2">
              <img 
                :src="message.imageUrl" 
                :alt="message.message || 'Shared image'"
                class="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                @click="openImageModal(message.imageUrl)"
                @error="handleImageError(message)"
              />
            </div>

            <!-- <p v-else class="text-sm">{{ message.message }}</p> -->
            <!-- Text Message -->
            <div v-if="message.message">
              <!-- Check if message contains URL -->
              <div v-if="message.linkUrl" class="space-y-2">
                <p class="text-sm">{{ getMessageWithoutUrl(message.message, message.linkUrl) }}</p>
                <a 
                  :href="message.linkUrl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded text-xs underline break-all',
                    message.senderId === currentUserId 
                      ? 'text-blue-100 hover:text-white' 
                      : 'text-blue-600 hover:text-blue-800'
                  ]"
                >
                  <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  <span>{{ formatUrl(message.linkUrl) }}</span>
                </a>
              </div>
              <p v-else class="text-sm">{{ message.message }}</p>
            </div>

            <!-- Message Footer -->
            <div
              :class="[
                'text-xs mt-1 flex items-center justify-between',
                message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
              ]"
            >
              <span>{{ formatTime(message.timestamp) }}</span>
              <div v-if="message.senderId === currentUserId" class="flex items-center">
                <svg
                  v-if="message.isRead"
                  class="w-3 h-3 text-green-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                </svg>
                <svg
                  v-else
                  class="w-3 h-3 text-blue-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white text-gray-600 px-4 py-2 rounded-lg border border-gray-200">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Preview -->
      <div v-if="imagePreview" class="p-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <img :src="imagePreview.url" alt="Preview" class="w-16 h-16 object-cover rounded-lg" />
            <button
              @click="removeImagePreview"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-700">{{ imagePreview.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(imagePreview.size) }}</p>
          </div>
          <button
            @click="sendImageMessage"
            :disabled="isUploadingImage"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {{ isUploadingImage ? 'Uploading...' : 'Send' }}
          </button>
        </div>
      </div>

      <!-- Input Area (only show when not showing rooms list or when user is not admin) -->
      <div v-if="!showRoomsList || currentUserRole !== 'Admin'" class="p-4 border-t border-gray-200 bg-white">
        <div class="flex space-x-2">
          <!-- Image Upload Button -->
          <div class="relative">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />
            <button
              @click="triggerFileUpload"
              :disabled="!isConnected || isLoading || (currentUserRole === 'Admin' && !selectedRoom)"
              class="text-gray-500 hover:text-blue-600 disabled:text-gray-300 p-2 transition-colors"
              title="Upload image"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>

          <input
            ref="messageInput"
            v-model="newMessage"
            @keyup.enter="sendMessage"
            @input="handleTyping"
            @blur="handleStopTyping"
            type="text"
            placeholder="Type your message..."
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :disabled="!isConnected || isLoading || (currentUserRole === 'Admin' && !selectedRoom)"
          />

          <!-- "!newMessage.trim() || !isConnected || isLoading || (currentUserRole === 'Admin' && !selectedRoom)" -->
          <button
            @click="sendMessage"
            :disabled="!canSendMessage"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              v-if="isLoading"
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Modal -->
  <div
    v-if="imageModal.show"
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    @click="closeImageModal"
  >
    <div class="max-w-4xl max-h-full p-4">
      <img
        :src="imageModal.url"
        alt="Full size image"
        class="max-w-full max-h-full object-contain"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import chatService from '@/services/chatService'
import chatApiService from '@/services/chatApiService'
import { useFetchUserId } from '@/composables/useFetchUserId'

// Reactive data
const route = useRoute()
const isOpen = ref(false)
const isConnected = ref(false)
const isLoading = ref(false)
const isTyping = ref(false)
const messages = ref([])
const newMessage = ref('')
const unreadCount = ref(0)
const chatRoomId = ref(null)
const messagesContainer = ref(null)
const messageInput = ref(null)

let typingTimeout = null

// Image handling
const imagePreview = ref(null)
const isUploadingImage = ref(false)
const isDragOver = ref(false)
const imageModal = ref({ show: false, url: '' })
const fileInput = ref(null)

// Admin rooms state
const adminRooms = ref([])
const selectedRoom = ref(null)
const showRoomsList = ref(false)

// Get auth data from localStorage (matching your auth system)
const { userId, role, fetchUserId } = useFetchUserId()

const currentUserId = computed(() => userId.value)
const currentUserRole = computed(() => role.value)

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('authToken') && !!currentUserId.value
})

const shouldShowChat = computed(() => {
  const excludedPages = ['login', 'register', 'forgot-password', 'reset-password-sent']
  const excludedPaths = ['/', '/register', '/forgot-password', '/reset-password-sent']
  
  const nameExcluded = route.name && excludedPages.includes(route.name)
  const pathExcluded = excludedPaths.includes(route.path)
  
  return !(nameExcluded || pathExcluded) && isAuthenticated.value
})

const canSendMessage = computed(() => {
  const hasContent = newMessage.value.trim() || imagePreview.value
  const isReady = isConnected.value && !isLoading.value && !isUploadingImage.value
  const hasRoom = currentUserRole.value !== 'Admin' || selectedRoom.value
  return hasContent && isReady && hasRoom
})

// Methods
const openChat = async () => {
  isOpen.value = true
  await initializeChat()
  await nextTick()
  if (messageInput.value) {
    messageInput.value.focus()
  }
}

const minimizeChat = () => {
  isOpen.value = false
}

const closeChat = () => {
  isOpen.value = false
  if (chatRoomId.value) {
    chatService.leaveRoom(chatRoomId.value)
  }
}

const initializeChat = async () => {
  try {
    if (!currentUserId.value) return

    // Connect to SignalR
    await connectToSignalR()

    console.log('Chat initialized for user:', currentUserRole.value)

    // Different logic for Admin vs User
    if (currentUserRole.value === 'Admin') {
      // Load admin support rooms
      await loadAdminRooms()
      showRoomsList.value = true // Show rooms list for admin
    } else {
      // Create or get admin support chat room for regular users
      await createAdminSupportRoom()
      // Load chat history
      await loadChatHistory()
    }

    // Set up event listeners
    setupEventListeners()

  } catch (error) {
    console.error('Failed to initialize chat:', error)
  }
}

const connectToSignalR = async () => {
  try {
    const token = localStorage.getItem('authToken')
    await chatService.connect(token)
    isConnected.value = true
  } catch (error) {
    console.error('Failed to connect to SignalR:', error)
    // Retry connection
    setTimeout(() => {
      if (!isConnected.value) {
        connectToSignalR()
      }
    }, 3000)
  }
}

const createAdminSupportRoom = async () => {
  try {
    // Use the new admin support room endpoint
    const response = await chatApiService.createAdminSupportRoom()
    chatRoomId.value = response.roomId
    await chatService.joinRoom(chatRoomId.value)
  } catch (error) {
    console.error('Failed to create admin support room:', error)
  }
}

const loadAdminRooms = async () => {
  try {
    if (currentUserRole.value === 'Admin') {
      const rooms = await chatApiService.getAdminSupportRoom()
      adminRooms.value = rooms
    }
  } catch (error) {
    console.error('Failed to load admin rooms:', error)
  }
}

const selectRoom = async (room) => {
  selectedRoom.value = room
  chatRoomId.value = room.id
  showRoomsList.value = false
  
  // Load chat history for selected room
  await loadChatHistory()
  
  // Join the room
  if (isConnected.value) {
    await chatService.joinRoom(chatRoomId.value)
  }
}

const toggleRoomsList = () => {
  showRoomsList.value = !showRoomsList.value
}

// Message Handling
const loadChatHistory = async () => {
  try {
    if (!chatRoomId.value) return
    
    const history = await chatApiService.getChatHistory(chatRoomId.value)
    
    // Process messages with images
    messages.value = await chatService.processMessages(history)
    
    // Count unread messages
    unreadCount.value = history.filter(m => 
      m.receiverId === currentUserId.value && !m.isRead
    ).length

    await nextTick()
    scrollToBottom()
    
    // Mark messages as read if chat is open
    if (isOpen.value) {
      await markMessagesAsRead()
    }
  } catch (error) {
    console.error('Failed to load chat history:', error)
  }
}

const sendMessage = async () => {
  if (!canSendMessage.value) return
  
  isLoading.value = true
  try {
    await chatService.sendMessage(chatRoomId.value, newMessage.value)
    newMessage.value = ''
    await handleStopTyping()
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    isLoading.value = false
  }
}

const sendImageMessage = async () => {
  if (!imagePreview.value || !chatRoomId.value) return

  isUploadingImage.value = true
  try {
    await chatService.sendMessageWithImageFile(
      chatRoomId.value,
      newMessage.value || '',
      imagePreview.value.file
    )
    
    // Clean up
    newMessage.value = ''
    removeImagePreview()
  } catch (error) {
    console.error('Failed to send image message:', error)
    alert('Failed to send image: ' + error.message)
  } finally {
    isUploadingImage.value = false
  }
}

// Image handling
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
  // Clear the input
  event.target.value = ''
}

const processImageFile = async (file) => {
  try {
    const imageData = chatService.prepareImageForUpload(file)
    imagePreview.value = imageData
  } catch (error) {
    alert(error.message)
  }
}

const removeImagePreview = () => {
  if (imagePreview.value) {
    chatService.cleanupImagePreview(imagePreview.value.previewUrl)
    imagePreview.value = null
  }
}

// Drag and drop handlers
const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      processImageFile(file)
    } else {
      alert('Please drop an image file.')
    }
  }
}

// Paste handler
const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        processImageFile(file)
        break
      }
    }
  }
}

// Image modal methods
const openImageModal = (url) => {
  imageModal.value = { show: true, url }
}

const closeImageModal = () => {
  imageModal.value = { show: false, url: '' }
}

const handleImageError = (message) => {
  console.error('Failed to load image:', message.imageId)
  // Could implement retry logic or placeholder image here
}

// URL formatting methods
const formatUrl = (url) => {
  if (!url) return ''
  if (url.length <= 35) return url
  
  // Remove protocol for display
  const cleanUrl = url.replace(/^https?:\/\//, '')
  if (cleanUrl.length <= 35) return cleanUrl
  
  // Truncate and add ellipsis
  return cleanUrl.substring(0, 32) + '...'
}

const getMessageWithoutUrl = (message, url) => {
  if (!message || !url) return message
  return message.replace(url, '').trim()
}

// Utility methods
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


const setupEventListeners = () => {
  chatService.onReceiveMessage(handleReceiveMessage)
  chatService.onMessageRead(handleMessageRead)
  chatService.onUserTyping(handleUserTyping)
  chatService.onUserStoppedTyping(handleUserStoppedTyping)
  chatService.onError(handleError)
}

const handleReceiveMessage = async (message) => {
  // Process message with image if present
  const processedMessage = await chatService.processReceivedMessage(message)
  messages.value.push(processedMessage)
  
  if (message.receiverId === currentUserId.value) {
    if (isOpen.value) {
      // Mark as read immediately if chat is open
      setTimeout(() => {
        chatApiService.markMessageAsRead(message.id)
      }, 1000)
    } else {
      // Increment unread count if chat is closed
      unreadCount.value++
    }
  }
  
  scrollToBottom()
}

const handleMessageRead = (messageId) => {
  const message = messages.value.find(m => m.id == messageId)
  if (message) {
    message.isRead = true
  }
}

const handleUserTyping = (userId) => {
  if (userId !== currentUserId.value) {
    isTyping.value = true
    setTimeout(() => {
      isTyping.value = false
    }, 3000)
  }
}

const handleUserStoppedTyping = (userId) => {
  if (userId !== currentUserId.value) {
    isTyping.value = false
  }
}

const handleError = (error) => {
  console.error('Chat error:', error)
}

const handleTyping = async () => {
  if (!chatRoomId.value) return
  
  await chatService.userTyping(chatRoomId.value)
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  typingTimeout = setTimeout(async () => {
    await handleStopTyping()
  }, 2000)
}

const handleStopTyping = async () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
  
  if (chatRoomId.value) {
    await chatService.userStoppedTyping(chatRoomId.value)
  }
}

const markMessagesAsRead = async () => {
  const unreadMessages = messages.value.filter(m => 
    m.receiverId === currentUserId.value && !m.isRead
  )
  
  for (const message of unreadMessages) {
    await chatApiService.markMessageAsRead(message.id)
    message.isRead = true
  }
  
  unreadCount.value = 0
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = (now - date) / (1000 * 60)
  
  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`
  } else if (diffInMinutes < 1440) { // 24 hours
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString()
  }
}

// Watchers
watch(() => isOpen.value, async (newValue) => {
  if (newValue && messages.value.length > 0) {
    await markMessagesAsRead()
  }
})

watch(() => shouldShowChat.value, (newValue) => {
  if (!newValue) {
    closeChat()
  }
})

// Lifecycle
onUnmounted(async () => {
  fetchUserId();

  if (chatRoomId.value) {
    await chatService.leaveRoom(chatRoomId.value)
  }
  await chatService.disconnect()
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Cleanup image preview
  removeImagePreview()
})

// Global event listeners for paste
onMounted(() => {
  document.addEventListener('paste', (event) => {
    if (isOpen.value && chatRoomId.value) {
      handlePaste(event)
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})
</script>

<style scoped>
/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Animation for drag over */
.transition-colors {
  transition: background-color 0.2s ease;
}

/* Image modal styles */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}
</style>