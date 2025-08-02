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
        class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
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
            <p class="text-sm">{{ message.message }}</p>
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

      <!-- Input Area (only show when not showing rooms list or when user is not admin) -->
      <div v-if="!showRoomsList || currentUserRole !== 'Admin'" class="p-4 border-t border-gray-200 bg-white">
        <div class="flex space-x-2">
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
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || !isConnected || isLoading || (currentUserRole === 'Admin' && !selectedRoom)"
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

const loadChatHistory = async () => {
  try {
    if (!chatRoomId.value) return
    
    const history = await chatApiService.getChatHistory(chatRoomId.value)
    messages.value = history
    
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
  if (!newMessage.value.trim() || !isConnected.value || !chatRoomId.value) return
  
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

const setupEventListeners = () => {
  chatService.onReceiveMessage(handleReceiveMessage)
  chatService.onMessageRead(handleMessageRead)
  chatService.onUserTyping(handleUserTyping)
  chatService.onUserStoppedTyping(handleUserStoppedTyping)
  chatService.onError(handleError)
}

const handleReceiveMessage = (message) => {
  messages.value.push(message)
  
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
</style>