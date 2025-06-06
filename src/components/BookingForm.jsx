import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingAPI } from '../services/api'
import { useBooking } from '../context/BookingContext'
import { 
  formatDateForInput, 
  formatTimeForInput, 
  combineDateTime, 
  validateTimeRange,
  isValidPosition
} from '../utils'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const BookingForm = ({ currentVid }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dispatch } = useBooking()
  const editId = searchParams.get('edit')
  
  const [formData, setFormData] = useState({
    position: '',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (editId) {
      loadBookingForEdit(editId)
    } else {
      // Set default values for new booking
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      setFormData({
        position: '',
        fromDate: formatDateForInput(tomorrow),
        fromTime: '00:00',
        toDate: formatDateForInput(tomorrow),
        toTime: '02:00'
      })
    }
  }, [editId])

  const loadBookingForEdit = async (id) => {
    try {
      setLoading(true)
      const booking = await bookingAPI.getBookingById(id)
      
      // Check if user owns this booking
      if (booking.vid !== currentVid) {
        setError('You can only edit your own bookings')
        return
      }
      
      const fromDate = new Date(booking.fromDate)
      const toDate = new Date(booking.toDate)
      
      setFormData({
        position: booking.position,
        fromDate: formatDateForInput(fromDate),
        fromTime: formatTimeForInput(fromDate),
        toDate: formatDateForInput(toDate),
        toTime: formatTimeForInput(toDate)
      })
      
      setIsEditing(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validateForm = () => {
    if (!currentVid) {
      return 'Please enter your VID first'
    }
    
    if (!formData.position.trim()) {
      return 'Position is required'
    }
    
    if (!isValidPosition(formData.position)) {
      return 'Invalid position format. Use format like: SBGR_APP, SBBR_TWR'
    }
    
    if (!formData.fromDate || !formData.fromTime) {
      return 'From date and time are required'
    }
    
    if (!formData.toDate || !formData.toTime) {
      return 'To date and time are required'
    }
    
    const fromDateTime = combineDateTime(formData.fromDate, formData.fromTime)
    const toDateTime = combineDateTime(formData.toDate, formData.toTime)
    
    const timeValidation = validateTimeRange(fromDateTime, toDateTime)
    if (!timeValidation.valid) {
      return timeValidation.error
    }
    
    // Check if booking is in the future (only for new bookings)
    if (!isEditing && fromDateTime <= new Date()) {
      return 'Booking must be in the future'
    }
    
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const bookingData = {
        position: formData.position.trim().toUpperCase(),
        fromDate: combineDateTime(formData.fromDate, formData.fromTime).toISOString(),
        toDate: combineDateTime(formData.toDate, formData.toTime).toISOString(),
        vid: currentVid
      }
      
      let result
      if (isEditing) {
        result = await bookingAPI.updateBooking(editId, bookingData)
        dispatch({ type: 'UPDATE_BOOKING', payload: result })
        setSuccess('Booking updated successfully!')
      } else {
        result = await bookingAPI.createBooking(bookingData)
        dispatch({ type: 'ADD_BOOKING', payload: result })
        setSuccess('Booking created successfully!')
      }
      
      // Redirect after success
      setTimeout(() => {
        navigate('/my-bookings')
      }, 2000)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (loading && isEditing) {
    return <LoadingSpinner message="Loading booking details..." />
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
                You need to enter your VID first to create or edit bookings. 
                Please use the VID input in the navigation bar.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                {isEditing ? 'Edit Booking' : 'New ATC Booking'}
              </h4>
            </div>
            <div className="card-body">
              {error && <ErrorMessage message={error} />}
              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="Position (e.g., SBGR_APP)"
                        required
                      />
                      <label htmlFor="position">Position *</label>
                      <div className="form-text">
                        Format: ICAO_TYPE (e.g., SBGR_APP, SBBR_TWR)
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={currentVid}
                        disabled
                        placeholder="VID"
                      />
                      <label>Controller VID</label>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="date"
                        className="form-control"
                        id="fromDate"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="fromDate">From Date *</label>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="time"
                        className="form-control"
                        id="fromTime"
                        name="fromTime"
                        value={formData.fromTime}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="fromTime">From Time *</label>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="date"
                        className="form-control"
                        id="toDate"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="toDate">To Date *</label>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="time"
                        className="form-control"
                        id="toTime"
                        name="toTime"
                        value={formData.toTime}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="toTime">To Time *</label>
                    </div>
                  </div>
                </div>
                
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Booking Guidelines:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Minimum duration: 30 minutes</li>
                    <li>Maximum duration: 8 hours</li>
                    <li>All times are in UTC</li>
                    <li>Future bookings only (for new bookings)</li>
                  </ul>
                </div>
                
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner me-2"></div>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} me-2`}></i>
                        {isEditing ? 'Update Booking' : 'Create Booking'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
