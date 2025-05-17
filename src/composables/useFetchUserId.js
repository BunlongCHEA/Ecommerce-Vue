import { ref, onMounted } from 'vue'

// Create a composable function to handle fetching user ID
export function useFetchUserId() {
  const userId = ref(null)
  const role = ref(null)

  const fetchUserId = () => {
    try {
      // Attempt to retrieve userId from localStorage
      const storedUserId = localStorage.getItem('userId')
      const storedRole = localStorage.getItem('role')

      console.log('Stored User ID (from localStorage):', storedUserId)
      console.log('Stored Role (from localStorage):', storedRole)

      if (storedUserId && storedRole) {
        userId.value = storedUserId
        role.value = storedRole

        return { userId: storedUserId, role: storedRole }
      }

      // If not found in localStorage, attempt to retrieve it from cookies
      const cookies = document.cookie.split('; ')
      console.log('Cookies:', cookies)

      const userIdCookie = cookies.find((row) => row.startsWith('userId='))
      const roleCookie = cookies.find((row) => row.startsWith('role='))

      console.log('User ID Cookie:', userIdCookie)
      console.log('Role Cookie:', roleCookie)

      if (userIdCookie && roleCookie) {
        userId.value = userIdCookie.split('=')[1]
        role.value = roleCookie.split('=')[1]

        return { userId: userId.value, role: role.value }
      }

      console.warn('User ID and Role not found in localStorage or cookies.')
      return { userId: null, role: null }
    } catch (error) {
      console.error('Error retrieving User ID and Role:', error)
      return { userId: null, role: null }
    }
  }

  // Automatically fetch user ID when this composable is used
  onMounted(() => {
    fetchUserId()
  })

  return {
    userId,
    role,
    fetchUserId,
  }
}