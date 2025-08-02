import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

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