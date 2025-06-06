import React, { useState, useEffect } from 'react';

/**
 * Modal component for creating and editing bookings
 */
const BookingForm = ({ booking, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    position: '',
    date: '',
    timeFrom: '',
    timeTo: '',
    type: 'normal'
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when booking prop changes
  useEffect(() => {
    if (booking) {
      setFormData({
        position: booking.position || '',
        date: booking.date || '',
        timeFrom: booking.timeFrom || '',
        timeTo: booking.timeTo || '',
        type: booking.type || 'normal'
      });
    } else {
      setFormData({
        position: '',
        date: '',
        timeFrom: '',
        timeTo: '',
        type: 'normal'
      });
    }
    setErrors({});
  }, [booking]);

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.position.trim()) {
      newErrors.position = 'Position identifier is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.timeFrom) {
      newErrors.timeFrom = 'Start time is required';
    }

    if (!formData.timeTo) {
      newErrors.timeTo = 'End time is required';
    }

    if (formData.timeFrom && formData.timeTo && formData.timeFrom >= formData.timeTo) {
      newErrors.timeTo = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      alert(error.message || 'Error saving booking');
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'position' ? value.toUpperCase() : value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Handle modal backdrop click
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Get minimum date for date input (today)
   */
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {booking ? 'Edit Booking' : 'New Booking'}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Position Identifier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Identifier *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="e.g., SBGR_TWR"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.position ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                min={getMinDate()}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From *
                </label>
                <input
                  type="time"
                  value={formData.timeFrom}
                  onChange={(e) => handleInputChange('timeFrom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.timeFrom ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.timeFrom && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeFrom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To *
                </label>
                <input
                  type="time"
                  value={formData.timeTo}
                  onChange={(e) => handleInputChange('timeTo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.timeTo ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.timeTo && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeTo}</p>
                )}
              </div>
            </div>

            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
                <option value="normal">Normal</option>
                <option value="training">Training</option>
                <option value="event">Event</option>
                <option value></option>
            </div>