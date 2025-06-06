import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingAPI } from '../services/api'
import { useBooking } from '../context/BookingContext'
import { formatDateTime, getBookingStatus, isBookingFuture } from '../utils'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const UserBookings = ({ currentVid }) => {
  const { dispatch } = useBooking()
  const [userBookings, setUserBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (currentVid) {
      fetchUserBookings()
    }
  }, [currentVid])

  const fetchUserBookings = async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await bookingAPI.getUserBookings(currentVid)
      setUserBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookingId) => {
    const booking = userBookings.find(b => b.id === bookingId)
    const confirmMessage = `Are you sure you want to delete the booking for ${booking.position}?`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setDeletingId(bookingId)
      await bookingAPI.deleteBooking(bookingId)
      
      // Update local state
      setUserBookings(prev => prev.filter(b => b.id !== bookingId))
      
      // Update global state
      dispatch({ type: 'DELETE_BOOKING', payload: bookingId })
      
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefresh = () => {
    fetchUserBookings()
  }

  if (!currentVid) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>VID Required</strong>
              <p className="mb-0 mt-2">
                You need to enter your VID first to view your bookings. 
                Please use the VID input in the navigation bar.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner message="Loading your bookings..." />
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={handleRefresh}
      />
    )
  }

  const futureBookings = userBookings.filter(isBookingFuture)
  const pastBookings = userBookings.filter(booking => !isBookingFuture(booking))

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-user me-2"></i>
                My Bookings (VID: {currentVid})
              </h4>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-light btn-sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
                <Link to="/book" className="btn btn-primary btn-sm">
                  <i className="fas fa-plus me-1"></i>
                  New Booking
                </Link>
              </div>
            </div>
            <div className="card-body">
              {userBookings.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No bookings found</h5>
                  <p className="text-muted mb-3">
                    You haven't created any ATC bookings yet.
                  </p>
                  <Link to="/book" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Create Your First Booking
                  </Link>
                </div>
              ) : (
                <>
                  {/* Future Bookings */}
                  {futureBookings.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">
                        <i className="fas fa-clock me-2"></i>
                        Upcoming Bookings ({futureBookings.length})
