import { format, parseISO, isAfter, isBefore, isToday, isPast } from 'date-fns'

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Format datetime for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Format date for HTML input
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  return formatDate(date, 'yyyy-MM-dd')
}

/**
 * Format time for HTML input
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string for input
 */
export const formatTimeForInput = (date) => {
  return formatDate(date, 'HH:mm')
}

/**
 * Combine date and time strings into a Date object
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} timeStr - Time string (HH:mm)
 * @returns {Date} Combined date object
 */
export const combineDateTime = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00`)
}

/**
 * Check if a booking is in the future
 * @param {Object} booking - The booking object
 * @returns {boolean} True if booking is in the future
 */
export const isBookingFuture = (booking) => {
  const fromDate = typeof booking.fromDate === 'string' ? parseISO(booking.fromDate) : booking.fromDate
  return isAfter(fromDate, new Date())
}

/**
 * Check if a booking is currently active
 * @param {Object} booking - The booking object
 * @returns {boolean} True if booking is currently active
 */
export const isBookingActive = (booking) => {
  const now = new Date()
  const fromDate = typeof booking.fromDate === 'string' ? parseISO(booking.fromDate) : booking.fromDate
  const toDate = typeof booking.toDate === 'string' ? parseISO(booking.toDate) : booking.toDate
  
  return isAfter(now, fromDate) && isBefore(now, toDate)
}

/**
 * Get booking status
 * @param {Object} booking - The booking object
 * @returns {Object} Status object with type and label
 */
export const getBookingStatus = (booking) => {
  if (isBookingActive(booking)) {
    return { type: 'success', label: 'Active' }
  } else if (isBookingFuture(booking)) {
    return { type: 'primary', label: 'Scheduled' }
  } else {
    return { type: 'secondary', label: 'Completed' }
  }
}

/**
 * Validate VID format
 * @param {string} vid - VID to validate
 * @returns {boolean} True if VID is valid
 */
export const isValidVID = (vid) => {
  if (!vid || typeof vid !== 'string') return false
  
  // Remove whitespace and check if it's a number between 100000 and 999999
  const cleanVid = vid.trim()
  const numVid = parseInt(cleanVid, 10)
  
  return /^\d{6}$/.test(cleanVid) && numVid >= 100000 && numVid <= 999999
}

/**
 * Validate position identifier
 * @param {string} position - Position to validate
 * @returns {boolean} True if position is valid
 */
export const isValidPosition = (position) => {
  if (!position || typeof position !== 'string') return false
  
  // Basic validation for ICAO position format (e.g., SBGR_APP, SBBR_TWR, etc.)
  const cleanPosition = position.trim().toUpperCase()
  return /^[A-Z]{4}_[A-Z]{2,3}$/.test(cleanPosition)
}

/**
 * Validate booking time range
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @returns {Object} Validation result
 */
export const validateTimeRange = (fromDate, toDate) => {
  if (!fromDate || !toDate) {
    return { valid: false, error: 'Both dates are required' }
  }
  
  if (isAfter(fromDate, toDate)) {
    return { valid: false, error: 'Start time must be before end time' }
  }
  
  const diffMinutes = (toDate - fromDate) / (1000 * 60)
  if (diffMinutes < 30) {
    return { valid: false, error: 'Booking must be at least 30 minutes long' }
  }
  
  if (diffMinutes > 480) { // 8 hours
    return { valid: false, error: 'Booking cannot exceed 8 hours' }
  }
  
  return { valid: true }
}

/**
 * Generate time options for select input
 * @param {number} intervalMinutes - Interval between options
 * @returns {Array} Array of time options
 */
export const generateTimeOptions = (intervalMinutes = 30) => {
  const options = []
  for (let hours = 0; hours < 24; hours++) {
