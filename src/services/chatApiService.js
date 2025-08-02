import api from '@/services/api'

class ChatApiService {
  // Create chat room between user and admin
  async createChatRoom(customerId, sellerId, storeId) {
    const response = await api.post('/chat/room', {
      customerId,
      sellerId,
      storeId
    })
    return response.data
  }

  // Get all chat rooms for current user
  async getUserChatRooms() {
    const response = await api.get('/chat/rooms')
    return response.data
  }

  // Get specific chat room details
  async getChatRoom(roomId) {
    const response = await api.get(`/chat/room/${roomId}`)
    return response.data
  }

  // Get chat history for a room
  async getChatHistory(roomId, page = 1, pageSize = 50) {
    const response = await api.get(`/chat/history/${roomId}`, {
      params: { page, pageSize }
    })
    return response.data
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    await api.post(`/chat/message/${messageId}/read`)
  }

  // Get unread messages count
  async getUnreadMessagesCount() {
    const response = await api.get('/chat/unread-count')
    return response.data
  }

  // Get unread messages count for specific room
  async getUnreadMessagesCountForRoom(roomId) {
    const response = await api.get(`/chat/room/${roomId}/unread-count`)
    return response.data
  }

  // Get available admin user
  async getAvailableAdmin() {
    try {
      const response = await api.get('/admin/available')
      return response.data
    } catch (error) {
      console.error('Failed to get admin user:', error)
      throw error
    }
  }

  // Create admin support chat room
  async createAdminSupportRoom() {
    try {
      const response = await api.post('/admin/support-room')
      return response.data
    } catch (error) {
      console.error('Failed to create admin support room:', error)
      throw error
    }
  }

  // Get admin support chat room for Admin role
  async getAdminSupportRoom() {
    try {
      const response = await api.get('/admin/support-rooms')
      return response.data
    } catch (error) {
      console.error('Failed to create admin support room:', error)
      throw error
    }
  }
}

export default new ChatApiService()