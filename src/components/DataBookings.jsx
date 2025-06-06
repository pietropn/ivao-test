import React, { useState } from 'react'
import { bookingAPI } from '../services/api'
import { formatDateTime, formatDateForInput, getBookingStatus } from '../utils'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const DateBookings = () => {
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()))
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const searchBookings = async () => {
    if (!selectedDate) {
      setError('Please select a date')
      return
    }

    try {
      setLoading(true)
      setError('')
      setHasSearched(false)
      
      const data = await bookingAPI.getBookingsByDate(selectedDate)
      setBookings(data)
      setHasSearched(true)
    } catch (err) {
      setError(err.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    searchBookings()
  }

  const isToday = selectedDate === formatDateForInput(new Date())
  const searchDate = new Date(selectedDate)
  const isValidDate = !isNaN(searchDate.getTime())

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                <i className="fas fa-search me-2"></i>
                Search Bookings by Date
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="row align-items-end">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="date"
                        className="form-control"
                        id="searchDate"
                        value={selectedDate}
                        onChange={handleDateChange}
                        required
                      />
                      <label htmlFor="searchDate">Select Date</label>
                    </div>
                  </div>
                  <div className="col-md-6 mt-3 mt-md-0">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !selectedDate}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner me-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-search me-2"></i>
                          Search Bookings
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {error && <ErrorMessage message={error} onRetry={searchBookings} />}

              {loading && <LoadingSpinner message="Searching bookings..." />}

              {hasSearched && !loading && !error && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                      <i className="fas fa-calendar-day me-2"></i>
                      Bookings for {isValidDate ? searchDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : selectedDate}
                      {isToday && <span className="badge bg-info ms-2">Today</span>}
                    </h5>
                    <span className="badge bg-secondary">
                      {bookings.length} booking(s) found
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No bookings found</h5>
                      <p className="text-muted">
                        There are no ATC bookings scheduled for this date.
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
                          {bookings.map((booking) => {
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
                </div>
              )}

              {!hasSearched && !loading && (
                <div className="text-center py-5">
                  <i className="fas fa-calendar-search fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Select a date to search</h5>
                  <p className="text-muted">
                    Choose any date to view ATC bookings for that day, including past dates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DateBookings
