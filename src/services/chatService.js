import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import chatApiService from './chatApiService'

class ChatService {
  constructor() {
    this.connection = null
    this.isConnected = false
    this.callbacks = {
      onReceiveMessage: [],
      onMessageRead: [],
      onUserTyping: [],
      onUserStoppedTyping: [],
      onError: []
    }
  }

  async connect(accessToken, baseUrl = 'http://localhost:5169') {
    if (this.isConnected) {
      return
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/chathub`, {
        accessTokenFactory: () => accessToken,
        skipNegotiation: false, // Allow negotiation
        withCredentials: true   // Required for CORS
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build()

    // Set up event handlers
    this.connection.on('ReceiveMessage', (message) => {
      this.callbacks.onReceiveMessage.forEach(callback => callback(message))
    })

    this.connection.on('MessageRead', (messageId) => {
      this.callbacks.onMessageRead.forEach(callback => callback(messageId))
    })

    this.connection.on('UserTyping', (userId) => {
      this.callbacks.onUserTyping.forEach(callback => callback(userId))
    })

    this.connection.on('UserStoppedTyping', (userId) => {
      this.callbacks.onUserStoppedTyping.forEach(callback => callback(userId))
    })

    this.connection.on('Error', (error) => {
      this.callbacks.onError.forEach(callback => callback(error))
    })

    try {
      await this.connection.start()
      this.isConnected = true
      console.log('SignalR Connected')
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
      throw err
    }
  }

  async joinRoom(roomId) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('JoinRoom', roomId.toString())
    }
  }

  async leaveRoom(roomId) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('LeaveRoom', roomId.toString())
    }
  }

  async sendMessage(roomId, message) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('SendMessage', roomId.toString(), message)
    }
  }

  // Send message with image via SignalR (requires image to be uploaded first)
  async sendMessageWithImage(roomId, message, imageId) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('SendMessageWithImage', roomId.toString(), message, imageId)
    }
  }

  // Send message with image file (upload + send in one operation)
  async sendMessageWithImageFile(roomId, message = '', imageFile = null) {
    try {
      let imageId = null
      
      // Upload image first if provided
      if (imageFile) {
        // Validate image file
        chatApiService.validateImageFile(imageFile)
        
        // Upload image
        const uploadResponse = await chatApiService.uploadImage(imageFile, roomId)
        imageId = uploadResponse.imageId
      }

      // Send message via SignalR if connected, otherwise use API
      if (this.isConnected && this.connection && imageId) {
        await this.sendMessageWithImage(roomId, message, imageId)
      } else if (this.isConnected && this.connection) {
        await this.sendMessage(roomId, message)
      } else {
        // Fallback to API if SignalR not connected
        return await chatApiService.sendMessageWithImage(roomId, message, imageFile)
      }
    } catch (error) {
      console.error('Error sending message with image:', error)
      throw error
    }
  }

  async markAsRead(messageId) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('MarkAsRead', messageId.toString())
    }
  }

  async userTyping(roomId) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('UserTyping', roomId.toString())
    }
  }

  async userStoppedTyping(roomId) {
    if (this.isConnected && this.connection) {
      await this.connection.invoke('UserStoppedTyping', roomId.toString())
    }
  }

  // Event subscription methods
  onReceiveMessage(callback) {
    this.callbacks.onReceiveMessage.push(callback)
  }

  onMessageRead(callback) {
    this.callbacks.onMessageRead.push(callback)
  }

  onUserTyping(callback) {
    this.callbacks.onUserTyping.push(callback)
  }

  onUserStoppedTyping(callback) {
    this.callbacks.onUserStoppedTyping.push(callback)
  }

  onError(callback) {
    this.callbacks.onError.push(callback)
  }

  // Helper methods for image handling
  async getImageUrl(imageId) {
    if (!imageId) return null
    try {
      return await chatApiService.getImage(imageId)
    } catch (error) {
      console.error('Error getting image URL:', error)
      return null
    }
  }

  // Process received message to include image URLs
  async processReceivedMessage(message) {
    const processedMessage = { ...message }
    
    if (message.imageId) {
      try {
        processedMessage.imageUrl = await this.getImageUrl(message.imageId)
      } catch (error) {
        console.error('Error processing image in message:', error)
        processedMessage.imageUrl = null
      }
    }

    return processedMessage
  }

  // Batch process messages with images
  async processMessages(messages) {
    const processedMessages = []
    
    for (const message of messages) {
      const processedMessage = await this.processReceivedMessage(message)
      processedMessages.push(processedMessage)
    }
    
    return processedMessages
  }

  // Validate and prepare image for upload
  prepareImageForUpload(file) {
    try {
      chatApiService.validateImageFile(file)
      return {
        file,
        previewUrl: chatApiService.createImagePreviewUrl(file),
        size: file.size,
        type: file.type,
        name: file.name
      }
    } catch (error) {
      throw error
    }
  }

  // Clean up image preview URL
  cleanupImagePreview(previewUrl) {
    if (previewUrl) {
      chatApiService.revokeImagePreviewUrl(previewUrl)
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
      this.isConnected = false
      this.callbacks = {
        onReceiveMessage: [],
        onMessageRead: [],
        onUserTyping: [],
        onUserStoppedTyping: [],
        onError: []
      }
    }
  }
}

export default new ChatService()