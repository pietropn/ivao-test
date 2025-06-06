import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add VID header when available
api.interceptors.request.use(
  (config) => {
    const vid = localStorage.getItem('ivao_vid')
    if (vid && vid.trim()) {
      config.headers['X-User-VID'] = vid.trim()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error occurred'
      throw new Error(message)
    } else if (error.request) {
      // Network error
      throw new Error('Network error - please check your connection')
    } else {
      // Other error
      throw new Error('An unexpected error occurred')
    }
  }
)

export const bookingAPI = {
  // Get all future bookings (public)
  getAllBookings: async () => {
    const response = await api.get('/bookings')
    return response.data
  },

  // Get bookings for specific date (public)
  getBookingsByDate: async (date) => {
    const response = await api.get(`/bookings/date/${date}`)
    return response.data
  },

  // Get user's bookings (requires VID)
  getUserBookings: async (vid) => {
    const response = await api.get(`/bookings/user/${vid}`)
    return response.data
  },

  // Create new booking (requires VID)
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData)
    return response.data
  },

  // Update existing booking (requires VID)
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData)
    return response.data
  },

  // Delete booking (requires VID)
  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`)
    return response.data
  },

  // Get booking by ID (for editing)
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  }
}

export default api
