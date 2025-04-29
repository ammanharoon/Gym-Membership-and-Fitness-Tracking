import React, { useState } from 'react';

const WorkoutDetailsModal = ({ workout, onClose, onBookSession }) => {
  const [bookingDate, setBookingDate] = useState(() => {
    // Set default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('10:00');

  const handleBooking = () => {
    onBookSession(workout, bookingDate, bookingTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Workout Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{workout.name || workout.program_name}</h4>
                <p className="text-sm text-gray-500">
                  {workout.category} • {workout.duration} {workout.duration ? 'min' : ''}
                </p>
              </div>
              {workout.date && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                  {new Date(workout.date).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {workout.description && (
              <p className="text-gray-700 mb-4">{workout.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {(workout.trainer || workout.trainer_name) && (
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Trainer</h5>
                  <p className="text-gray-700">{workout.trainer || workout.trainer_name}</p>
                </div>
              )}
              {workout.location && (
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Location</h5>
                  <p className="text-gray-700">{workout.location}</p>
                </div>
              )}
            </div>
            
            {workout.equipment && (
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Equipment Needed</h5>
                <p className="text-gray-700">{workout.equipment}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Book a Session</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <button
              onClick={handleBooking}
              className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailsModal;