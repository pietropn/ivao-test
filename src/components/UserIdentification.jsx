import React from 'react';
import { User, Plus } from 'lucide-react';

/**
 * User identification component with VID input and new booking button
 */
const UserIdentification = ({ userVid, onVidChange, onNewBooking }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-4">
        <User className="text-blue-600" size={24} />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your VID (Virtual ID)
          </label>
          <input
            type="text"
            value={userVid}
            onChange={(e) => onVidChange(e.target.value)}
            placeholder="Enter your VID (e.g., 123456)"
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onNewBooking}
          disabled={!userVid}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          New Booking
        </button>
      </div>
    </div>
  );
};

export default UserIdentification;