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
            <div v-if="message.message && message.message.trim()">
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

            <!-- Show placeholder if no message and no image -->
            <p v-if="!message.message?.trim() && !message.imageId" class="text-sm italic opacity-75">
              (Empty message)
            </p>

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
const unreadCountInterval = ref(null)
const chatRoomId = ref(null)
const messagesContainer = ref(null)
const messageInput = ref(null)

let typingTimeout = null
const TYPING_INDICATOR_DELAY = 3000 // milliseconds
const SIGNALR_RECONNECT_INTERVAL = 10000 // milliseconds
const RESTART_UNREAD_COUNT_INTERVAL = 15000 // milliseconds


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

// Helper: find index of message by id in current visible array
const findMessageIndex = (id) => {
  return messages.value.findIndex(m => m.id === id)
}

// Attach the receive listener only once
const listenersAttached = ref(false)

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

  // When opening, clear visible messages (they will be reloaded by initializeChat)
  messages.value = []
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
  showRoomsList.value = false
  selectedRoom.value = null
  messages.value = []
  
  if (chatRoomId.value) {
    chatService.leaveRoom(chatRoomId.value)
    chatRoomId.value = null
  }
}

const initializeChat = async () => {
  try {
    if (!currentUserId.value) return

    // Connect to SignalR if not already connected
    if (!isConnected.value) {
      await connectToSignalR()
      setupEventListeners()
    }

    // Connect to SignalR
    // await connectToSignalR()

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
    }, SIGNALR_RECONNECT_INTERVAL)
  }
}


// Chat Room Management

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

      // Request update via SignalR instead of API
      // const rooms = await chatService.getAdminRoomsUpdate()
      // adminRooms.value = rooms

      // Calculate total unread count for admin
      unreadCount.value = rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
    } else {
      console.error('Fallback load getAdminSupportRoom:', error)
      // Fallback to API if SignalR not connected
      // const rooms = await chatApiService.getAdminSupportRoom()
      // handleAdminRoomsUpdate(rooms)
    }
  } catch (error) {
    console.error('Failed to load admin rooms:', error)

    // // Fallback to API on error
    // try {
    //   const rooms = await chatApiService.getAdminSupportRoom()
    //   handleAdminRoomsUpdate(rooms)
    // } catch (apiError) {
    //   console.error('API fallback also failed:', apiError)
    // }
  }
}

const selectRoom = async (room) => {
  selectedRoom.value = room

  // Leave previous room if exists
  if (chatRoomId.value) {
    await chatService.leaveRoom(chatRoomId.value)
  }

  chatRoomId.value = room.id
  showRoomsList.value = false

  // Clear messages for new room
  messages.value = []
  
  // Load chat history for selected room
  await loadChatHistory()
  
  // Join the room
  if (isConnected.value) {
    await chatService.joinRoom(chatRoomId.value)
  }

  // Mark all messages as read immediately
  await markMessagesAsRead()
  
  // Reload admin rooms to update unread counts
  if (currentUserRole.value === 'Admin') {
    await loadAdminRooms()
  }
}

const toggleRoomsList = () => {
  showRoomsList.value = !showRoomsList.value
  
  if (showRoomsList.value) {
    // Clear selected room and messages
    selectedRoom.value = null
    messages.value = []
    
    if (chatRoomId.value) {
      chatService.leaveRoom(chatRoomId.value)
      chatRoomId.value = null
    }
  }
}


// Messsage Events and Typing Indicators

// Message Handling
const loadChatHistory = async () => {
  try {
    if (!chatRoomId.value) return
    
    console.log('Loading chat history for room:', chatRoomId.value)

     // Clear current visible messages for this room first
    messages.value = []
    
    const history = await chatApiService.getChatHistory(chatRoomId.value)
    
    // Process messages with images
    // messages.value = await chatService.processMessages(history)
    // console.log('Processed messages:', messages.value.length)
    
    // Process messages with images
    // chatService.processMessages should return an array of full message objects
    const processed = await chatService.processMessages(history)

    // Assign the processed messages directly (preserves order from server)
    messages.value = processed

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

// Fetch initial unread count on mount
const fetchInitialUnreadCount = async () => {
  try {
    if (!currentUserId.value || currentUserRole.value === 'Admin') return

    // Subscribe to real-time unread count via SignalR
    const response = await chatService.subscribeToUnreadCount()
    console.log('Subscribed to unread count updates, initial count:', response.unreadCount)
    
    // Get or create the admin support room first
    // const response = await chatApiService.createAdminSupportRoom()
    const roomId = response.roomId
    
    // Fetch chat history for this room
    const history = await chatApiService.getChatHistory(roomId)
    
    // Count unread messages
    unreadCount.value = history.filter(m => 
      m.receiverId === currentUserId.value && !m.isRead
    ).length
  } catch (error) {
    console.error('Failed to fetch initial unread count:', error)
  }
}

const sendMessage = async () => {
  if (!canSendMessage.value) return
  
  // Prevent double-click
  if (isLoading.value) return
  
  const messageText = newMessage.value.trim()
  // if (!messageText) return
  if (!messageText) {
    // If there is an image but empty text, allow sendImageMessage to handle
    if (!imagePreview.value) return
  }
  
  isLoading.value = true
  const messageCopy = messageText // Keep a copy
  newMessage.value = '' // Clear immediately
  
  try {
    await chatService.sendMessage(chatRoomId.value, messageCopy)
    console.log('Message sent successfully')
    await handleStopTyping()
  } catch (error) {
    console.error('Failed to send message:', error)
    // Restore message on error
    newMessage.value = messageCopy
  } finally {
    isLoading.value = false
  }
}


// Handle image message sending

const sendImageMessage = async () => {
  if (!imagePreview.value || !chatRoomId.value) return

  // Prevent double-click
  if (isUploadingImage.value) return

  isUploadingImage.value = true
  const messageText = newMessage.value || ''
  const imageFile = imagePreview.value.file

  // Clear immediately to prevent re-sending
  newMessage.value = ''
  removeImagePreview()

  try {
    await chatService.sendMessageWithImageFile(
      chatRoomId.value,
      messageText,
      imageFile
    )
    
    // // Clean up
    // newMessage.value = ''
    // removeImagePreview()
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


// Handle URLs in messages

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
  if (listenersAttached.value) return
  listenersAttached.value = true

  chatService.onReceiveMessage(handleReceiveMessage)
  chatService.onMessageRead(handleMessageRead)
  chatService.onUserTyping(handleUserTyping)
  chatService.onUserStoppedTyping(handleUserStoppedTyping)
  chatService.onError(handleError)

  // Real-time unread count and admin rooms updates
  chatService.onUnreadCountUpdate(handleUnreadCountUpdate)
  chatService.onAdminRoomsUpdate(handleAdminRoomsUpdate)

  // Subscribe immediately after setting up listeners
  if (currentUserRole.value !== 'Admin') {
    chatService.subscribeToUnreadCount()
  }

  // // Listen for messages even when chat is closed to update badge
  // chatService.onReceiveMessage((message) => {
  //   if (!isOpen.value && message.receiverId === currentUserId.value) {
  //     unreadCount.value++
  //   }
  // })
}


// Event Handlers

// const handleReceiveMessage = async (message) => {

//   // If chat is open and message is for current room, display it
//   if (isOpen.value && message.chatRoomId === chatRoomId.value) {
//     // Process message with image if present
//     const processedMessage = await chatService.processReceivedMessage(message)
//     messages.value.push(processedMessage)
    
//     console.log('Added message to display. Total messages:', messages.value.length)
    
//     // Mark as read if it's for current user and chat is open
//     if (message.receiverId === currentUserId.value) {
//       setTimeout(() => {
//         chatApiService.markMessageAsRead(message.id)
//       }, 1000)
//     }
    
//     scrollToBottom()
//   } else {
//     // Chat is closed or message is for different room
//     if (message.receiverId === currentUserId.value) {
//       unreadCount.value++
//       console.log('Incremented unread count:', unreadCount.value)
//     }
//   }
  
//   // Update admin rooms list if admin
//   if (currentUserRole.value === 'Admin') {
//     await loadAdminRooms()
//   }
// }

//  - No Set-based global dedupe.
//  - If message already in messages.value, update it (status/image/etc.)
//  - If not present and message belongs to current open room, push it.
//  - If chat closed and message is for current user, increment unreadCount.
const handleReceiveMessage = async (message) => {
  try {
    // Defensive logs (remove later if verbose)
    // console.debug('handleReceiveMessage', message)

    // If message exists in visible list -> update it (e.g., isRead, imageUrl, message text)
    const idx = findMessageIndex(message.id)
    if (idx !== -1) {
      // Update existing message object in-place to preserve reactivity
      const existing = messages.value[idx]
      // Merge known fields from incoming message
      existing.isRead = message.isRead ?? existing.isRead
      existing.timestamp = message.timestamp ?? existing.timestamp
      existing.linkUrl = message.linkUrl ?? existing.linkUrl
      existing.hasImage = message.hasImage ?? existing.hasImage
      existing.imageId = message.imageId ?? existing.imageId
      // ensure message text is not lost – prefer incoming if not null/undefined (even if empty string)
      existing.message = message.message !== undefined ? message.message : existing.message

      // If message has imageId but no imageUrl yet, let chatService enrich it
      if (existing.imageId && !existing.imageUrl) {
        const enriched = await chatService.processReceivedMessage(message)
        // merge any additional fields (imageUrl, etc.)
        Object.assign(existing, enriched)
      }
      // ensure scroll if chat open and message is in current room
      if (isOpen.value && message.chatRoomId === chatRoomId.value) {
        scrollToBottom()
      }
      return
    }

    // Message not currently visible
    const isForCurrentRoom = isOpen.value && message.chatRoomId === chatRoomId.value

    if (isForCurrentRoom) {
      // Process (resolve image URLs etc.) and display
      const processedMessage = await chatService.processReceivedMessage(message)

      // If the server sometimes sends null/undefined for message, ensure property exists
      if (processedMessage.message === undefined) {
        processedMessage.message = ''
      }

      messages.value.push(processedMessage)

      // If this is a message the current user received and the chat is open, mark read
      if (message.receiverId === currentUserId.value) {
        // small delay to allow UI to settle
        setTimeout(() => {
          chatApiService.markMessageAsRead(message.id).catch(err => {
            console.error('markMessageAsRead error', err)
          })
        }, 800)
      }

      scrollToBottom()
    } else {
      // Chat closed or different room -> increment unread count only if message is for current user
      if (message.receiverId === currentUserId.value) {
        unreadCount.value = (unreadCount.value || 0) + 1
      }

      // If admin, refresh rooms (so admin sees updated unread counts)
      if (currentUserRole.value === 'Admin') {
        // don't await to avoid blocking signal handling, but catch errors
        loadAdminRooms().catch(err => console.error('loadAdminRooms error', err))
      }
    }
  } catch (err) {
    console.error('handleReceiveMessage failed', err)
  }
}

// Add handler for unread count updates
const handleUnreadCountUpdate = (count) => {
  console.log('Unread count updated from SignalR:', count)
  unreadCount.value = count
}

// Add handler for admin rooms updates
const handleAdminRoomsUpdate = (rooms) => {
  console.log('Admin rooms updated from SignalR:', rooms)
  adminRooms.value = rooms
  
  // Calculate total unread count for admin
  unreadCount.value = rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
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
    }, TYPING_INDICATOR_DELAY)
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
  }, TYPING_INDICATOR_DELAY)
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

// Utility functions

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


// Unread count polling

const startUnreadCountPolling = () => {
  // Poll every ?? seconds when chat is closed
  unreadCountInterval.value = setInterval(async () => {
    if (!isOpen.value && shouldShowChat.value) {
      if (currentUserRole.value === 'Admin') {
        await loadAdminRooms()
      } else {
        await fetchInitialUnreadCount()
      }
    }
  }, RESTART_UNREAD_COUNT_INTERVAL)
}

// const startUnreadCountPolling = () => {
//   // Reduced polling frequency as SignalR handles real-time updates
//   unreadCountInterval.value = setInterval(async () => {
//     // Only poll as fallback if connection is lost
//     if (!isConnected.value && shouldShowChat.value) {
//       console.log('SignalR disconnected, using API fallback')
//       if (currentUserRole.value === 'Admin') {
//         const rooms = await chatApiService.getAdminSupportRoom()
//         handleAdminRoomsUpdate(rooms)
//       } else {
//         // Fallback to API for unread count
//         const response = await chatApiService.createAdminSupportRoom()
//         const history = await chatApiService.getChatHistory(response.roomId)
//         const count = history.filter(m => 
//           m.receiverId === currentUserId.value && !m.isRead
//         ).length
//         unreadCount.value = count
//       }
//     }
//   }, 5000) // Increased to 60 seconds since SignalR handles real-time
// }

const stopUnreadCountPolling = () => {
  if (unreadCountInterval.value) {
    clearInterval(unreadCountInterval.value)
    unreadCountInterval.value = null
  }
}


// Real time connection management

// Add this computed property to check if SignalR should connect
const shouldConnectSignalR = computed(() => {
  return shouldShowChat.value && currentUserId.value && isAuthenticated.value
})

// Modify onMounted to establish SignalR connection early
onMounted(async () => {
  await fetchUserId()
  
  // Connect to SignalR immediately if authenticated
  if (shouldConnectSignalR.value) {
    await connectToSignalR()
    
    // Set up listeners immediately for real-time updates
    setupEventListeners()
    
    // Fetch initial data based on role
    if (currentUserRole.value === 'Admin') {
      await loadAdminRooms()
      // await chatService.getAdminRoomsUpdate()
    } else {
      await fetchInitialUnreadCount()
      // await chatService.subscribeToUnreadCount()
    }
    
    // startUnreadCountPolling()
  }
  
  // Global paste event listener
  document.addEventListener('paste', (event) => {
    if (isOpen.value && chatRoomId.value) {
      handlePaste(event)
    }
  })
})

// // Add this new method to set up global listeners (before setupEventListeners)
// const setupGlobalEventListeners = () => {
//   // Listen for new messages to update unread count
//   chatService.onReceiveMessage(handleGlobalReceiveMessage)
  
//   // Listen for message read events
//   chatService.onMessageRead(handleGlobalMessageRead)
// }

// // New handler for global message reception (updates unread count)
// const handleGlobalReceiveMessage = async (message) => {
//   console.log('Global message received:', message)
  
//   if (currentUserRole.value === 'Admin') {
//     // Update admin rooms list
//     await loadAdminRooms()
//   } else {
//     // Update user unread count if chat is closed
//     if (!isOpen.value && message.receiverId === currentUserId.value) {
//       unreadCount.value++
//     }
//   }
// }

// // New handler for global message read events
// const handleGlobalMessageRead = (data) => {
//   if (currentUserRole.value === 'Admin') {
//     // Refresh admin rooms to update unread counts
//     loadAdminRooms()
//   }
// }


// Watchers
watch(() => isOpen.value, async (newValue) => {
  if (newValue && messages.value.length > 0) {
    await markMessagesAsRead()
  }
})

watch(() => shouldShowChat.value, async (newValue) => {
  if (!newValue) {
    closeChat()
  } else if (newValue && !isConnected.value) {
    // Show chat and not connected yet
    await connectToSignalR()
    setupEventListeners()
    
    if (currentUserRole.value === 'Admin') {
      await loadAdminRooms()
    } else {
      await fetchInitialUnreadCount()
    }
  }
})

// Fetch initial unread count when authenticated or authentication state changes
watch(() => isAuthenticated.value, async (newValue, oldValue) => {
  if (newValue && !oldValue && currentUserId.value) {
    // User just logged in
    await connectToSignalR()
    setupEventListeners()
    
    if (currentUserRole.value === 'Admin') {
      await loadAdminRooms()
    } else {
      await fetchInitialUnreadCount()
    }
    
    startUnreadCountPolling()
  }
})

// watcher for userId changes
watch(() => currentUserId.value, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    // UserId changed, reconnect
    if (isConnected.value) {
      await chatService.disconnect()
    }
    
    await connectToSignalR()
    setupEventListeners()
    
    if (currentUserRole.value === 'Admin') {
      await loadAdminRooms()
    } else {
      await fetchInitialUnreadCount()
    }
  }
})

// Lifecycle
onUnmounted(async () => {
  fetchUserId();
  // stopUnreadCountPolling();

  if (chatRoomId.value) {
    await chatService.leaveRoom(chatRoomId.value)
  }
  await chatService.disconnect()
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Cleanup image preview
  removeImagePreview()
  document.removeEventListener('paste', handlePaste)
})

// Global event listeners for paste
onMounted(async () => {
  // Fetch userId first
  await fetchUserId()

  // Fetch initial unread count before chat is opened
  if (shouldShowChat.value && currentUserRole.value !== 'Admin') {
    await fetchInitialUnreadCount()
    startUnreadCountPolling()
  }

  // Global paste event listener
  document.addEventListener('paste', (event) => {
    if (isOpen.value && chatRoomId.value) {
      handlePaste(event)
    }
  })
})

onUnmounted(async () => {
  stopUnreadCountPolling()
  
  if (chatRoomId.value) {
    await chatService.leaveRoom(chatRoomId.value)
  }
  await chatService.disconnect()
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  removeImagePreview()
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