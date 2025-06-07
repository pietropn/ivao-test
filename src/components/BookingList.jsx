import React, { useEffect, useState } from 'react'
import { bookingAPI } from '../services/api'
import { useBooking } from '../context/BookingContext'
import { formatDateTime, getBookingStatus } from '../utils'

const BookingList = () => {
  const { bookings, loading, error, dispatch } = useBooking()
  const [localLoading, setLocalLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLocalLoading(true)
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const data = await bookingAPI.getAllBookings()
      dispatch({ type: 'SET_BOOKINGS', payload: data })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message })
    } finally {
      setLocalLoading(false)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleRefresh = () => {
    fetchBookings()
  }

  if (loading || localLoading) {
    return <LoadingSpinner message="Loading future bookings..." />
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={handleRefresh}
      />
    )
  }

  const futureBookings = bookings.filter(booking => {
    const fromDate = new Date(booking.fromDate)
    return fromDate > new Date()
  })

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-calendar-alt me-2"></i>
                Future ATC Bookings
              </h4>
              <button 
                className="btn btn-light btn-sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {futureBookings.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No future bookings found</h5>
                  <p className="text-muted">
                    There are currently no scheduled ATC positions for the future.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Controller</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {futureBookings.map((booking) => {
                        const status = getBookingStatus(booking)
                        const duration = Math.round(
                          (new Date(booking.toDate) - new Date(booking.fromDate)) / (1000 * 60)
                        )
                        
                        return (
                          <tr key={booking.id}>
                            <td>
                              <span className="position-badge">
                                {booking.position}
                              </span>
                            </td>
                            <td>
                              <span className="vid-badge">
                                {booking.vid}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted d-block">
                                {formatDateTime(booking.fromDate)}
                              </small>
                            </td>
                            <td>
                              <small className="text-muted d-block">
                                {formatDateTime(booking.toDate)}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {Math.floor(duration / 60)}h {duration % 60}m
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${status.type}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {futureBookings.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Showing {futureBookings.length} future booking(s) sorted by position and date
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingList
