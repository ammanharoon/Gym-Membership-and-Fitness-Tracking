import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

const Dashboard = () => {
  const { user, membershipTier, logout, token } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  useEffect(() => {
    // Fetch user data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Example API call to get user workouts
        const workoutsResponse = await fetch("http://localhost:5000/api/workouts", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          setWorkouts(workoutsData.workouts || []);
        }
        
        // Example API call to get user stats
        const statsResponse = await fetch("http://localhost:5000/api/user/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  // Placeholder data for demo purposes - added trainer names and descriptions
  const demoWorkouts = [
    { 
      id: 1, 
      name: "Morning Strength", 
      date: "2025-03-22", 
      duration: 45, 
      category: "Strength", 
      trainer: "Sarah Johnson",
      description: "Full-body strength training session focusing on compound movements and functional fitness. Suitable for intermediate level.",
      equipment: "Dumbbells, Kettlebells, Resistance bands",
      location: "Main gym floor - Station 3"
    },
    { 
      id: 2, 
      name: "Cardio Session", 
      date: "2025-03-20", 
      duration: 30, 
      category: "Cardio", 
      trainer: "Michael Chen",
      description: "High-intensity interval training to improve cardiovascular health and endurance. Includes warm-up and cool-down periods.",
      equipment: "Treadmill, Rowing machine, Jump rope",
      location: "Cardio area - Station 2"
    },
    { 
      id: 3, 
      name: "Yoga Flow", 
      date: "2025-03-18", 
      duration: 60, 
      category: "Flexibility", 
      trainer: "Emma Rodriguez",
      description: "Vinyasa flow yoga session connecting breath to movement. Focus on improving flexibility, balance, and mindfulness.",
      equipment: "Yoga mat, Blocks, Straps",
      location: "Studio B"
    }
  ];
  
  const demoStats = {
    monthlyVisits: 12,
    avgDuration: 45,
    streak: 3,
    caloriesBurned: 4500,
    completedWorkouts: 15
  };

  // Use demo data if API data isn't available yet
  const displayWorkouts = workouts.length > 0 ? workouts : demoWorkouts;
  const displayStats = stats || demoStats;
  
  // Membership plan details
  const membershipDetails = {
    basic: { 
      color: "bg-blue-500",
      name: "Basic Plan",
      features: ["Gym Access", "Locker Access"]
    },
    standard: {
      color: "bg-purple-500",
      name: "Standard Plan",
      features: ["Gym Access", "Locker Access", "Group Classes"]
    },
    premium: {
      color: "bg-indigo-700",
      name: "Premium Plan",
      features: ["Gym Access", "Locker Access", "Group Classes", "Personal Trainer", "Sauna Access"]
    }
  };
  
  const currentPlan = membershipDetails[membershipTier] || membershipDetails.basic;

  const handleViewWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowModal(true);
    // Set default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingTime('10:00');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedWorkout(null);
  };

  const handleBookSession = () => {
    // Simulate booking API call
    console.log(`Booking session for ${selectedWorkout.name} with ${selectedWorkout.trainer} on ${bookingDate} at ${bookingTime}`);
    
    // Show confirmation and close modal
    alert(`Session booked successfully!\n\nWorkout: ${selectedWorkout.name}\nTrainer: ${selectedWorkout.trainer}\nDate: ${bookingDate}\nTime: ${bookingTime}`);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation bar */}
      <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl">Gym System</span>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-sm">Welcome, {user?.name || "Member"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "overview" 
                  ? "text-indigo-600 border-b-2 border-indigo-600" 
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("workouts")}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "workouts" 
                  ? "text-indigo-600 border-b-2 border-indigo-600" 
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              Workouts
            </button>
            <button 
              onClick={() => setActiveTab("membership")}
              className={`py-2 px-4 font-medium transition-colors ${
                activeTab === "membership" 
                  ? "text-indigo-600 border-b-2 border-indigo-600" 
                  : "text-gray-500 hover:text-indigo-500"
              }`}
            >
              Membership
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Stats Cards */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Monthly Visits</h3>
                    <p className="text-3xl font-bold text-gray-800">{displayStats.monthlyVisits}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Current Streak</h3>
                    <p className="text-3xl font-bold text-gray-800">{displayStats.streak} days</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Workouts Completed</h3>
                    <p className="text-3xl font-bold text-gray-800">{displayStats.completedWorkouts}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-500 text-sm font-medium">Est. Calories Burned</h3>
                    <p className="text-3xl font-bold text-gray-800">{displayStats.caloriesBurned}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <div className="col-span-2 bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-800">Recent Workouts</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {displayWorkouts.length > 0 ? (
                        displayWorkouts.map((workout) => (
                          <div key={workout.id} className="px-6 py-4">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-800">{workout.name}</h4>
                                <p className="text-xs text-gray-500">{workout.date}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                                  {workout.category}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">{workout.duration} min</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-center text-gray-500">
                          No recent workouts found.
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-3 bg-gray-50">
                      <button 
                        onClick={() => setActiveTab("workouts")}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View all workouts
                      </button>
                    </div>
                  </div>
                  
                  {/* Membership Card */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className={`${currentPlan.color} px-6 py-4 text-white`}>
                      <h3 className="font-medium">{currentPlan.name}</h3>
                      <p className="text-xs opacity-80">Active Membership</p>
                    </div>
                    <div className="px-6 py-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Features Included:</h4>
                      <ul className="space-y-1">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="px-6 py-3 bg-gray-50">
                      <button 
                        onClick={() => setActiveTab("membership")}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Manage membership
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Workouts Tab - Added Trainer column */}
            {activeTab === "workouts" && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">Your Workout History</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors">
                    Log Workout
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Workout
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trainer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayWorkouts.map((workout) => (
                        <tr key={workout.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{workout.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{workout.date}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{workout.duration} min</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                              {workout.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{workout.trainer || "Not Assigned"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => handleViewWorkout(workout)} 
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              View
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {displayWorkouts.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <p>No workouts recorded yet.</p>
                    <button className="mt-2 text-indigo-600 hover:text-indigo-500">
                      Start logging your workouts
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Membership Tab */}
            {activeTab === "membership" && (
              <div>
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className={`${currentPlan.color} px-6 py-4 text-white rounded-t-lg`}>
                    <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                    <p className="text-sm opacity-80">Active since March 2025</p>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Membership Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Features Included:</h5>
                        <ul className="mt-2 space-y-1">
                          {currentPlan.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-500">Billing Information:</h5>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">Next billing date: April 23, 2025</p>
                          <p className="text-sm text-gray-700">Payment method: Visa ending in 4242</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors">
                        Change Plan
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                        Update Payment
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Billing History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Mar 23, 2025
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Monthly Membership - {currentPlan.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            $25.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Paid
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Workout Details Modal */}
      {showModal && selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Workout Details</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              {/* Workout Information */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedWorkout.name}</h4>
                    <p className="text-sm text-gray-500">{selectedWorkout.category} • {selectedWorkout.duration} min</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    {selectedWorkout.date}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{selectedWorkout.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">Trainer</h5>
                    <p className="text-gray-700">{selectedWorkout.trainer || "Not Assigned"}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">Location</h5>
                    <p className="text-gray-700">{selectedWorkout.location || "Main Gym"}</p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">Equipment Needed</h5>
                  <p className="text-gray-700">{selectedWorkout.equipment || "No special equipment required"}</p>
                </div>
              </div>
              
              {/* Booking Section */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Book a Session</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Schedule a new session with {selectedWorkout.trainer} for this workout program.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min={new Date().toISOString().split('T')[0]} // Today as minimum date
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
                  onClick={handleBookSession}
                  className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
                >
                  Book Session
                </button>
              </div>
              
              {/* Past Sessions */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">Past Sessions</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    <div className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mar 15, 2025</p>
                        <p className="text-xs text-gray-500">with {selectedWorkout.trainer}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                    <div className="px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mar 8, 2025</p>
                        <p className="text-xs text-gray-500">with {selectedWorkout.trainer}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;