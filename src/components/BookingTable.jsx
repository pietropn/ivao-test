import React from 'react';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

/**
 * Get background color class for booking type
 */
const getTypeColor = (type) => {
  switch (type) {
    case 'training': return 'bg-blue-100 text-blue-800';
    case 'event': return 'bg-purple-100 text-purple-800';
    case 'exam': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Navigation tabs component
 */
const NavigationTabs = ({ activeTab, onTabChange, selectedDate, onDateChange }) => {
  const tabs = [
    { id: 'all', label: 'All Future Bookings' },
    { id: 'date', label: 'By Date' },
    { id: 'my', label: 'My Bookings' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date filter for 'date' tab */}
      {activeTab === 'date' && (
        <div className="p-6 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Table header component
 */
const TableHeader = ({ activeTab, selectedDate }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'all': return 'All Future Bookings';
      case 'date': return `Bookings for ${selectedDate ? formatDate(selectedDate) : 'Selected Date'}`;
      case 'my': return 'My Bookings';
      default: return 'Bookings';
    }
  };

  return (
    <div className="px-6 py-4 border-b bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800">{getTitle()}</h2>
    </div>
  );
};

/**
 * Empty state component
 */
const EmptyState = () => (
  <div className="p-8 text-center text-gray-500">
    <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
    <p>No bookings found</p>
  </div>
);

/**
 * Loading state component
 */
const LoadingState = () => (
  <div className="p-8 text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    <p className="mt-2 text-gray-600">Loading...</p>
  </div>
);

/**
 * Action buttons for booking row
 */
const ActionButtons = ({ booking, userVid, onEdit, onDelete }) => {
  const isOwner = booking.vid === userVid;
  const isFutureBooking = new Date(booking.date) >= new Date();
  const canModify = isOwner && isFutureBooking;

  if (!userVid || !canModify) return null;

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onEdit(booking)}
        className="text-blue-600 hover:text-blue-900 transition-colors"
        title="Edit booking"
      >
        <Edit size={16} />
      </button>
      <button
        onClick={() => onDelete(booking)}
        className="text-red-600 hover:text-red-900 transition-colors"
        title="Delete booking"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

/**
 * Main booking table component
 */
const BookingTable = ({
  bookings,
  loading,
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  userVid,
  onEdit,
  onDelete
}) => {
  return (
    <>
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <TableHeader activeTab={activeTab} selectedDate={selectedDate} />
        
        {loading ? (
          <LoadingState />
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  {userVid && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Calendar size={16} />
                        {formatDate(booking.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Clock size={16} />
                        {booking.timeFrom} - {booking.timeTo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.vid}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(booking.type)}`}>
                        {booking.type}
                      </span>
                    </td>
                    {userVid && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionButtons
                          booking={booking}
                          userVid={userVid}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingTable;