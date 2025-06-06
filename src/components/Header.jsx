import React from 'react';

/**
 * Header component with IVAO branding
 */
const Header = () => {
  return (
    <div className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-2">IVAO ATC Booking System</h1>
        <p className="text-blue-200">Manage your ATC position bookings</p>
      </div>
    </div>
  );
};

export default Header;