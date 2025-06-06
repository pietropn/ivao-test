import React, { createContext, useContext, useReducer } from 'react'

const BookingContext = createContext()

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  lastUpdated: null
}

const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_BOOKINGS':
      return { 
        ...state, 
        bookings: action.payload, 
        loading: false, 
        error: null,
        lastUpdated: new Date()
      }
    
    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, action.payload].sort((a, b) => 
          a.position.localeCompare(b.position) || 
          new Date(a.fromDate) - new Date(b.fromDate)
        ),
        error: null
      }
    
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id ? action.payload : booking
        ).sort((a, b) => 
          a.position.localeCompare(b.position) || 
          new Date(a.fromDate) - new Date(b.fromDate)
        ),
        error: null
      }
    
    case 'DELETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.payload),
        error: null
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const value = {
    ...state,
    dispatch
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}
