import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr'
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

    // Determine the correct base URL based on environment
    const hubUrl = baseUrl.includes('localhost') 
      ? `${baseUrl}/chathub` 
      : `${baseUrl}/chathub`

    console.log('Connecting to SignalR hub at:', hubUrl)

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          console.log('Providing access token for SignalR connection')
          return accessToken || ''
        },
        transport: HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
        skipNegotiation: false, // Allow negotiation (required for proper transport selection)
        withCredentials: true,  // Required for CORS with credentials
        headers: {
          'User-Agent': 'SignalR-Client',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Additional options for production environment
        timeout: 30000, // 30 seconds timeout
        serverTimeoutInMilliseconds: 60000, // 60 seconds server timeout
        keepAliveIntervalInMilliseconds: 15000 // 15 seconds keep-alive
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Custom retry logic: 0s, 2s, 10s, 30s, then stop
          if (retryContext.previousRetryCount === 0) {
            return 0
          } else if (retryContext.previousRetryCount === 1) {
            return 2000
          } else if (retryContext.previousRetryCount === 2) {
            return 10000
          } else if (retryContext.previousRetryCount === 3) {
            return 30000
          } else {
            // Stop retrying after 4 attempts
            return null
          }
        }
      })
      .configureLogging(LogLevel.Information)
      .build()

    // Connection state change handlers
    this.connection.onreconnecting((error) => {
      console.warn('SignalR connection lost due to error. Reconnecting...', error)
      this.isConnected = false
    })

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected. Connection ID:', connectionId)
      this.isConnected = true
    })

    this.connection.onclose((error) => {
      console.error('SignalR connection closed:', error)
      this.isConnected = false
      // Notify error callbacks
      this.callbacks.onError.forEach(callback => callback({
        type: 'connection_closed',
        message: 'SignalR connection closed',
        error: error
      }))
    })

    // this.connection = new HubConnectionBuilder()
    //   .withUrl(`${baseUrl}/chathub`, {
    //     accessTokenFactory: () => accessToken,
    //     skipNegotiation: false, // Allow negotiation
    //     withCredentials: true   // Required for CORS
    //   })
    //   .withAutomaticReconnect()
    //   .configureLogging(LogLevel.Information)
    //   .build()

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
      console.error('SignalR hub error:', error)
      this.callbacks.onError.forEach(callback => callback(error))
    })

    try {
      console.log('Starting SignalR connection...')
      await this.connection.start()
      this.isConnected = true
      console.log('SignalR Connected successfully. Connection ID:', this.connection.connectionId)
      console.log('Transport:', this.connection.transport?.name)
    } catch (err) {
      console.error('SignalR Connection Error: ', err)
      
      // Enhanced error handling
      if (err.message?.includes('negotiate')) {
        console.error('Negotiation failed. This might be a CORS or authentication issue.')
      } else if (err.message?.includes('Failed to fetch')) {
        console.error('Network error. Check if the server is accessible and CORS is properly configured.')
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        console.error('Authentication failed. Check if the access token is valid.')
      }
      
      this.isConnected = false
      throw err
    }
  }

  // Enhanced connection validation
  isConnectionActive() {
    return this.isConnected && 
           this.connection && 
           this.connection.state === 'Connected'
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