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

  // Upload image to chat
  async uploadImage(file, chatRoomId, description = null) {
    const formData = new FormData()
    formData.append('File', file)
    formData.append('ChatRoomId', chatRoomId)
    if (description) {
      formData.append('Description', description)
    }

    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  // Get image by ID (returns blob URL for display)
  async getImage(imageId) {
    const response = await api.get(`/chat/${imageId}`, {
      responseType: 'blob'
    })
    return URL.createObjectURL(response.data)
  }

  // Get image info (metadata)
  async getImageInfo(imageId) {
    const response = await api.get(`/chat/info/${imageId}`)
    return response.data
  }

  // Delete image
  async deleteImage(imageId) {
    await api.delete(`/chat/${imageId}`)
  }

  // Get all images for a chat room
  async getChatRoomImages(chatRoomId) {
    const response = await api.get(`/chat/room/${chatRoomId}/images`)
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

  // Helper method to validate image file
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.')
    }

    return true
  }

  // Helper method to create image preview URL
  createImagePreviewUrl(file) {
    return URL.createObjectURL(file)
  }

  // Helper method to revoke image preview URL
  revokeImagePreviewUrl(url) {
    URL.revokeObjectURL(url)
  }
}

export default new ChatApiService()