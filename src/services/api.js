import axios from 'axios'
// import { useRouter } from 'vue-router'
// const router = useRouter()

let router = null // Placeholder for the router instance

// Function to set the router dynamically
export const setRouter = (vueRouter) => {
  router = vueRouter
}

// Create an Axios instance for the ASP.NET backend
const api = axios.create({
  baseURL: 'http://localhost:5169/api', // ASP.NET backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout for requests.If a request takes longer than 5 seconds, it will be automatically canceled.
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

// Automatically retrieves the user’s authentication token from localStorage (if it exists) to ensure when the app initializes or reloads, the authToken stored in localStorage is automatically applied to the Axios instance via the Authorization header.
const token = localStorage.getItem('authToken') // Use the correct key (authToken)
if (token) {
  setAuthToken(token) // Ensure the token is applied
}

// Add a response interceptor to detect 401 Unauthorized responses (reason token expiration)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('JWT token expired or unauthorized. Logging out...')
      handleLogout()
    }
    return Promise.reject(error)
  }
)

// Logout function to clear stored credentials and redirect
export const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('role')
  document.cookie = 'userId=; role=; path=/; max-age=0' // Clear userId cookie
  setAuthToken(null)

  if (router) {
    router.push('/') // Redirect to login page
  } else {
    console.error('Router is not initialized. Cannot navigate to login route.')
  }
}

export default api
