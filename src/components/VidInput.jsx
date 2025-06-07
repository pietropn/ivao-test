import React, { useState, useEffect } from 'react';

/**
 * VidInput Component
 * Handles user VID input for authentication purposes
 * Provides a simple form for users to enter their IVAO Virtual ID
 */
const VidInput = ({ onVidChange, currentVid }) => {
  const [vid, setVid] = useState(currentVid || '');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setVid(currentVid || '');
  }, [currentVid]);

  /**
   * Validates VID format
   * IVAO VIDs are typically 6-digit numbers
   * @param {string} vidValue - VID to validate
   * @returns {boolean} - Whether VID is valid
   */
  const validateVid = (vidValue) => {
    // Remove any whitespace
    const cleanVid = vidValue.trim();
    
    // Check if it's empty
    if (!cleanVid) {
      setError('VID is required');
      return false;
    }
    
    // Check if it's a number
    if (!/^\d+$/.test(cleanVid)) {
      setError('VID must contain only numbers');
      return false;
    }
    
    // Check length (IVAO VIDs are typically 6 digits, but can vary)
    if (cleanVid.length < 4 || cleanVid.length > 7) {
      setError('VID must be between 4 and 7 digits');
      return false;
    }
    
    setError('');
    return true;
  };

  /**
   * Handles input change
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setVid(value);
    
    // Validate in real-time but don't show errors until user stops typing
    const valid = validateVid(value);
    setIsValid(valid);
  };

  /**
   * Handles form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedVid = vid.trim();
    const valid = validateVid(trimmedVid);
    
    if (valid && onVidChange) {
      onVidChange(trimmedVid);
    }
  };

  /**
   * Handles clearing the VID
   */
  const handleClear = () => {
    setVid('');
    setError('');
    setIsValid(true);
    if (onVidChange) {
      onVidChange('');
    }
  };

  /**
   * Handles input blur (when user leaves the field)
   */
  const handleBlur = () => {
    if (vid.trim()) {
      validateVid(vid);
    }
  };

  return (
    <div className="vid-input-container">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">User Identification</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="vidInput" className="form-label">
                Enter your IVAO Virtual ID (VID) *
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${error ? 'is-invalid' : isValid && vid ? 'is-valid' : ''}`}
                  id="vidInput"
                  value={vid}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 485573"
                  maxLength="7"
                  autoComplete="off"
                />
                {vid && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClear}
                    title="Clear VID"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {error && (
                <div className="invalid-feedback d-block">
                  {error}
                </div>
              )}
              
              {!error && vid && isValid && (
                <div className="valid-feedback d-block">
                  VID format is valid
                </div>
              )}
              
              <div className="form-text">
                Your VID is used to identify your bookings and manage your reservations.
                You can find your VID in your IVAO profile.
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!vid.trim() || !isValid}
              >
                Set VID
              </button>
              
              {currentVid && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
          
          {currentVid && (
            <div className="mt-3 p-2 bg-light rounded">
              <small className="text-muted">
                Current VID: <strong>{currentVid}</strong>
              </small>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Section */}
      <div className="mt-3">
        <div className="card border-info">
          <div className="card-body">
            <h6 className="card-title text-info">
              <i className="bi bi-info-circle"></i> What is a VID?
            </h6>
            <p className="card-text small mb-0">
              Your Virtual ID (VID) is your unique identifier in the IVAO network. 
              It's typically a 6-digit number assigned when you register with IVAO. 
              This ID is used to authenticate your requests and ensure you can only 
              manage your own bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VidInput;
