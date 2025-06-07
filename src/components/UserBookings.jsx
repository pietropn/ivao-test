import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingAPI } from '../services/api'
import { useBooking } from '../context/BookingContext'
import { formatDateTime, getBookingStatus, isBookingFuture } from '../utils'

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

  const renderBookingTable = (bookings, title, emptyMessage) => {
    if (bookings.length === 0) return null

    return (
      <div className="mb-4">
        <h5 className="text-primary mb-3">
          <i className="fas fa-clock me-2"></i>
          {title} ({bookings.length})
        </h5>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Position</th>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>
                    <span className="fw-bold text-primary">
                      {booking.position}
                    </span>
                  </td>
                  <td>
                    {formatDateTime(booking.fromDateTime, 'date')}
                  </td>
                  <td>
                    {formatDateTime(booking.fromDateTime, 'time')}
                  </td>
                  <td>
                    {formatDateTime(booking.toDateTime, 'time')}
                  </td>
                  <td>
                    <span className={`badge ${getBookingStatusClass(booking)}`}>
                      {getBookingStatus(booking)}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      {isBookingFuture(booking) && (
                        <>
                          <Link
                            to={`/edit/${booking.id}`}
                            className="btn btn-outline-primary"
                            title="Edit booking"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(booking.id)}
                            disabled={deletingId === booking.id}
                            title="Delete booking"
                          >
                            {deletingId === booking.id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-outline-info"
                        onClick={() => showBookingDetails(booking)}
                        title="View details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const getBookingStatusClass = (booking) => {
    const status = getBookingStatus(booking)
    switch (status) {
      case 'Active':
        return 'bg-success'
      case 'Upcoming':
        return 'bg-primary'
      case 'Past':
        return 'bg-secondary'
      case 'Expired':
        return 'bg-warning text-dark'
      default:
        return 'bg-light text-dark'
    }
  }

  const showBookingDetails = (booking) => {
    const details = `
Booking Details:
━━━━━━━━━━━━━━━━━━━━
Position: ${booking.position}
Date: ${formatDateTime(booking.fromDateTime, 'date')}
Time: ${formatDateTime(booking.fromDateTime, 'time')} - ${formatDateTime(booking.toDateTime, 'time')}
Status: ${getBookingStatus(booking)}
VID: ${booking.vid}
Created: ${formatDateTime(booking.createdAt)}
${booking.notes ? `Notes: ${booking.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
    `
    alert(details)
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
                  {renderBookingTable(
                    futureBookings, 
                    'Upcoming Bookings', 
                    'No upcoming bookings'
                  )}

                  {/* Past Bookings */}
                  {pastBookings.length > 0 && (
                    <div className="mt-4">
                      {renderBookingTable(
                        pastBookings.slice(0, 10), // Show only last 10 past bookings
                        'Recent Past Bookings',
                        'No past bookings'
                      )}
                      {pastBookings.length > 10 && (
                        <div className="text-center mt-3">
                          <small className="text-muted">
                            Showing last 10 past bookings. Total past bookings: {pastBookings.length}
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="row mt-4">
                    <div className="col-md-4">
                      <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                          <h3 className="mb-0">{futureBookings.length}</h3>
                          <small>Upcoming Bookings</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-secondary text-white">
                        <div className="card-body text-center">
                          <h3 className="mb-0">{pastBookings.length}</h3>
                          <small>Past Bookings</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-info text-white">
                        <div className="card-body text-center">
                          <h3 className="mb-0">{userBookings.length}</h3>
                          <small>Total Bookings</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-question-circle me-2"></i>
                Need Help?
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Managing Your Bookings</h6>
                  <ul className="list-unstyled">
                    <li><i className="fas fa-edit text-primary me-2"></i>Edit upcoming bookings</li>
                    <li><i className="fas fa-trash text-danger me-2"></i>Delete unwanted bookings</li>
                    <li><i className="fas fa-eye text-info me-2"></i>View detailed information</li>
                    <li><i className="fas fa-sync-alt text-secondary me-2"></i>Refresh to see latest data</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Booking Status</h6>
                  <ul className="list-unstyled">
                    <li><span className="badge bg-primary me-2">Upcoming</span>Future bookings</li>
                    <li><span className="badge bg-success me-2">Active</span>Currently active</li>
                    <li><span className="badge bg-secondary me-2">Past</span>Completed bookings</li>
                    <li><span className="badge bg-warning text-dark me-2">Expired</span>Missed bookings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserBookings
