import React from 'react';
import { Calendar, User, Activity, Settings } from 'lucide-react';

const OverviewTab = ({ stats, workouts, currentPlan, onViewAllWorkouts, onManageMembership }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        {stats && (
          <>
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-gray-400 text-sm font-medium">Monthly Visits</h3>
              <p className="text-3xl font-bold text-white">{stats.monthlyVisits || 0}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-gray-400 text-sm font-medium">Current Streak</h3>
              <p className="text-3xl font-bold text-white">{stats.streak || 0} days</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-gray-400 text-sm font-medium">Workouts Completed</h3>
              <p className="text-3xl font-bold text-white">{stats.completedWorkouts || 0}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-gray-400 text-sm font-medium">Est. Calories Burned</h3>
              <p className="text-3xl font-bold text-white">{stats.caloriesBurned || 0}</p>
            </div>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700">
            <h3 className="text-lg font-medium text-purple-300">Recent Workouts</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {workouts && workouts.length > 0 ? (
              workouts.slice(0, 3).map((workout) => (
                <div key={workout.id} className="px-6 py-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">{workout.name}</h4>
                      <p className="text-xs text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-900 text-purple-200">
                        {workout.category}
                      </span>
                      <span className="ml-2 text-sm text-gray-400">{workout.duration} min</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-400">
                No recent workouts found.
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-700">
            <button 
              onClick={onViewAllWorkouts}
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              View all workouts
            </button>
          </div>
        </div>
        
        {/* Membership Card */}
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className={`bg-purple-700 px-6 py-4 text-white`}>
            <h3 className="font-medium">{currentPlan?.name || "Premium Plan"}</h3>
            <p className="text-xs opacity-80">Active Membership</p>
          </div>
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Features Included:</h4>
            <ul className="space-y-1">
              {currentPlan?.features ? (
                currentPlan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-center">
                    <svg className="h-4 w-4 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))
              ) : (
                <>
                  <li className="text-sm text-gray-400 flex items-center">
                    <svg className="h-4 w-4 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited Access
                  </li>
                  <li className="text-sm text-gray-400 flex items-center">
                    <svg className="h-4 w-4 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority Support
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="px-6 py-3 bg-gray-700">
            <button 
              onClick={onManageMembership}
              className="text-sm font-medium text-purple-300 hover:text-purple-200"
            >
              Manage membership
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;