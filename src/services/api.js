import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// Create an Axios instance for the ASP.NET backend
const api = axios.create({
  baseURL: 'http://localhost:5169/api', // ASP.NET backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Timeout for requests.If a request takes longer than 5 seconds, it will be automatically canceled.
})

// Function to set the Authorization token
// If a token is provided, it sets the Authorization header to Bearer <token>. This header is typically required for authenticated API requests.
// If no token is provided (e.g., logging out), it removes the Authorization header.
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Automatically retrieves the user’s authentication token from localStorage (if it exists) to ensure all requests include the token in the Authorization header.
const token = localStorage.getItem('authToken') // Use the correct key (authToken)
if (token) {
  setAuthToken(token) // Ensure the token is applied
}

export default api
