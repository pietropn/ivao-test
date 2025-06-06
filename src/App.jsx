import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserIdentification from './components/UserIdentification';
import BookingTable from './components/BookingTable';
import BookingForm from './components/BookingForm';
import { api } from './services/api';

const App = () => {
  // State management
  const [userVid, setUserVid] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Filter bookings when dependencies change
  useEffect(() => {
    filterBookings();
  }, [bookings, activeTab, selectedDate, userVid]);

  /**
   * Load all bookings from API
   */
  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter bookings based on active tab and selected criteria
   */
  const filterBookings = () => {
    let filtered = [...bookings];
    const today = new Date().toISOString().split('T')[0];

    switch (activeTab) {
      case 'all':
        // Show all future bookings, sorted by position
        filtered = filtered
          .filter(booking => booking.date >= today)
          .sort((a, b) => a.position.localeCompare(b.position));
        break;
      
      case 'date':
        // Show bookings for specific date
        if (selectedDate) {
          filtered = filtered.filter(booking => booking.date === selectedDate);
        } else {
          filtered = [];
        }
        break;
      
      case 'my':
        // Show user's future bookings
        if (userVid) {
          filtered = filtered
            .filter(booking => booking.vid === userVid && booking.date >= today)
            .sort((a, b) => 
              new Date(a.date + ' ' + a.timeFrom) - new Date(b.date + ' ' + b.timeFrom)
            );
        } else {
          filtered = [];
        }
        break;
      
      default:
        break;
    }

    setFilteredBookings(filtered);
  };

  /**
   * Handle booking creation or update
   */
  const handleBookingSave = async (bookingData) => {
    if (!userVid) {
      throw new Error('Please enter your VID first');
    }

    setLoading(true);
    try {
      const dataWithVid = { ...bookingData, vid: userVid };
      
      if (editingBooking) {
        await api.updateBooking(editingBooking.id, dataWithVid);
      } else {
        await api.createBooking(dataWithVid);
      }
      
      await loadBookings();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle booking edit
   */
  const handleEdit = (booking) => {
    if (booking.vid !== userVid) {
      alert('You can only edit your own bookings');
      return;
    }
    setEditingBooking(booking);
    setShowBookingForm(true);
  };

  /**
   * Handle booking deletion
   */
  const handleDelete = async (booking) => {
    if (booking.vid !== userVid) {
      alert('You can only delete your own bookings');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    setLoading(true);
    try {
      await api.deleteBooking(booking.id);
      await loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Close booking form and reset state
   */
  const handleCloseForm = () => {
    setEditingBooking(null);
    setShowBookingForm(false);
  };

  /**
   * Open new booking form
   */
  const handleNewBooking = () => {
    if (!userVid) {
      alert('Please enter your VID first');
      return;
    }
    setEditingBooking(null);
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* User identification section */}
        <UserIdentification 
          userVid={userVid}
          onVidChange={setUserVid}
          onNewBooking={handleNewBooking}
        />

        {/* Booking table with tabs */}
        <BookingTable
          bookings={filteredBookings}
          loading={loading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userVid={userVid}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Booking form modal */}
        {showBookingForm && (
          <BookingForm
            booking={editingBooking}
            onSave={handleBookingSave}
            onClose={handleCloseForm}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default App;