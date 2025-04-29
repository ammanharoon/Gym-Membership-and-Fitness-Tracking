import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AppAuth';
import axios from "axios";

// Import components - fixing paths
import OverviewTab from './dashboard/OverviewTab';
import WorkoutsTab from './dashboard/WorkoutsTab';
import ProgramsTab from './dashboard/ProgramsTab';
import MembershipTab from './dashboard/MembershipTab';
import FitnessTrackingTab from './dashboard/FitnessTrackingTab';
import WorkoutDetailsModal from './dashboard/WorkoutDetailsModal';
import PaymentConfirmationModal from './dashboard/PaymentConfirmationModal';
import ChangePlanModal from './ChangePlanModal';
import fitnessTrackingService from '../services/fitnessTrackingService';



const Dashboard = () => {
  const { user, membershipTier, logout, token, updateMembership } = useAuth();
  const navigate = useNavigate();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showModal, setShowModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const userId = user?.id || parseInt(localStorage.getItem("userId"));
  const programId = selectedProgram?.id || parseInt(localStorage.getItem("programId"));
  const [purchasedPrograms, setPurchasedPrograms] = useState([]);
  const [selectedProgram1, setSelectedProgram1] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);


  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, [userId, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch programs
      try {
        const programsRes = await axios.get("http://localhost:5000/api/programs");
        setPrograms(programsRes.data.programs);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
        setError("Failed to load programs.");
      }

      // Fetch purchased programs
      if (userId) {
        try {
          const userProgramsRes = await axios.get(`http://localhost:5000/api/user-programs/${userId}`);
          setPurchasedPrograms(userProgramsRes.data.programs);
        } catch (err) {
          console.error("Failed to fetch user programs:", err);
        }
      }

      // Fetch user stats
      if (token) {
        try {
          const statsResponse = await axios.get(
            "http://localhost:5000/api/user/stats",
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (statsResponse.status === 200) {
            setStats(statsResponse.data);
          }
        } catch (err) {
          console.error("Failed to fetch user stats:", err);
        }
      }

    } catch (error) {
      console.error("Error fetching user dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleViewWorkout = (workout) => {
    setSelectedWorkout(workout);
  };

  const handleCloseWorkoutModal = () => {
    setSelectedWorkout(null);
  };

  const handleBuyProgram = (program) => {
    setSelectedProgram(program);
  };

  const handleCancelPurchase = () => {
    setSelectedProgram(null);
  };

  const handleConfirmPurchase = (program) => {
    setSelectedProgram(program);
    //setShowModal(true);
  };

  const handleBookSession = (workout, date, time) => {
    console.log(`Booking session for ${workout.name} on ${date} at ${time}`);
    alert(`Session booked successfully!\n\nWorkout: ${workout.name}\nDate: ${date}\nTime: ${time}`);
    setSelectedWorkout(null);
  };

  const confirmPurchase = async () => {
    const programId = selectedProgram?.id || parseInt(localStorage.getItem("programId"));
    const token = localStorage.getItem("token"); // Get JWT token from storage
    
    if (!programId || !token) {
      alert("Program information or authentication is missing.");
      return;
    }
    
    try {
      console.log("Sending purchase request for program:", programId);
      
      const response = await axios.post(
        "http://localhost:5000/api/buy-program", 
        { programId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("✅ Purchase successful:", response.data);
      
      // Store userId if returned from API
      if (response.data.userId) {
        localStorage.setItem("userId", response.data.userId);
      }
      
      // Add the purchased program to the purchasedPrograms list
      if (selectedProgram) {
        setPurchasedPrograms(prev => [...prev, selectedProgram]);
      }
      
      // Reset UI state
      setSelectedProgram(null);
      setPaymentMessage("✅ Payment Confirmed!");
      setTimeout(() => setPaymentMessage(""), 3000);
      
    } catch (error) {
      console.error("❌ Purchase failed:", error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        // Redirect to login
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Payment failed. Please try again.");
      }
    }
  };

  const handleOpenChangePlanModal = () => {
    setShowChangePlanModal(true);
  };

  const handleCloseChangePlanModal = () => {
    setShowChangePlanModal(false);
  };

  const handlePlanChangeSuccess = (newPlan) => {
    setShowChangePlanModal(false);
    alert(`Membership changed to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} Plan successfully!`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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

  const handleProgramClick = async (program) => {
    console.log("Clicked program:", program);
    try {
      const response = await axios.get(`http://localhost:5000/api/trainer-details`, {
        params: { trainerId: program.trainer_id }
      });
      console.log("Trainer details:", response.data);
  
      setSelectedProgram1({
        ...program,
        trainerName: response.data.name,
        trainerEmail: response.data.email,
      });
      setShowProgramModal(true);
    } catch (error) {
      console.error("Error fetching trainer details:", error);
      alert("Could not fetch trainer details.");
    }
  };
  
  const currentPlan = membershipDetails[membershipTier] || membershipDetails.basic;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top navigation bar */}
      <nav className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-semibold text-xl tracking-wide">Gym System</span>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-sm text-gray-300">Welcome, {user?.name || "Member"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-purple-700 hover:bg-purple-600 rounded-md transition-colors duration-200"
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
  <div className="flex space-x-4 border-b border-black-700 overflow-x-auto pb-1">
    {["overview", "workouts", "programs", "fitness-tracking", "membership"].map((tab) => (
      <button 
        key={tab}
        onClick={() => handleTabChange(tab)}
        className={`py-2 px-4 font-medium transition-colors whitespace-nowrap ${
          activeTab === tab 
            ? "text-purple-400 border-b-2 border-purple-400" 
            : "text-gray-400 hover:text-purple-300"
        }`}
      >
        {tab === "fitness-tracking" 
          ? "Fitness Tracking"
          : tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>
</div>

{loading ? (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <OverviewTab 
                stats={stats} 
                workouts={workouts} 
                currentPlan={currentPlan} 
                onViewAllWorkouts={() => setActiveTab("workouts")}
                onManageMembership={() => setActiveTab("membership")}
              />
            )}
            
            {/* Workouts Tab */}
            {activeTab === "workouts" && (
  <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
      <h3 className="text-lg font-medium text-purple-300">Your Workout History</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Program Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Trainer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Category
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {purchasedPrograms.length > 0 ? (
            purchasedPrograms.map((program) => (
              <tr key={program.program_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{program.program_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{program.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{program.duration}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{program.trainer_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">{program.category}</div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                No workouts recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
            
            {/* Programs Tab */}
            {activeTab === "programs" && (
  <div className="p-4">
    {paymentMessage && (
      <div className="mb-4 text-purple-400 font-semibold text-center">
        {paymentMessage}
      </div>
    )}
    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-purple-300">All Training Programs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {programs.length > 0 ? (
              programs
                .filter(program => !purchasedPrograms.some(purchased => purchased.id === program.id))
                .map((program) => (
                  <tr key={program.id}>
                    <td 
                    onClick={() => handleProgramClick(program)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-purple-300 font-medium cursor-pointer hover:underline"
                    >
                      {program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {program.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {program.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleBuyProgram(program)} 
                        className="text-purple-300 hover:text-purple-200"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  No programs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>

)}

        {/* Modal for Program Details */}
        {showProgramModal && selectedProgram1 && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl w-96 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
      <h2 className="text-2xl font-bold mb-6 text-purple-300 tracking-tight">
        {selectedProgram1.name}
      </h2>
      <div className="space-y-4">
        <p className="text-gray-300">
          <strong className="font-semibold text-white">Trainer Name:</strong> {selectedProgram1.trainerName}
        </p>
        <p className="text-gray-300">
          <strong className="font-semibold text-white">Trainer Email:</strong> {selectedProgram1.trainerEmail}
        </p>
        <p className="text-gray-300">
          <strong className="font-semibold text-white">Description:</strong> {selectedProgram1.description}
        </p>
        <p className="text-gray-300">
          <strong className="font-semibold text-white">Duration:</strong> {selectedProgram1.duration}
        </p>
      </div>
      <button
        onClick={() => setShowProgramModal(false)}
        className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200"
      >
        Close
      </button>
    </div>
  </div>
)}

{/* 💸 Payment Modal */}
{selectedProgram && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-purple-300">Confirm Purchase</h2>
      <p className="mb-4 text-gray-300">
        Are you sure you want to buy the <strong className="text-white">{selectedProgram.name}</strong> program?
      </p>
      <div className="flex justify-end space-x-4">
        <button
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          onClick={() => setSelectedProgram(null)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={confirmPurchase}
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  </div>
)}

            
            {/* Fitness Tracking Tab */}
            {activeTab === "fitness-tracking" && (
              <FitnessTrackingTab 
                userId={userId} 
                token={token}
              />
            )}
            
            {/* Membership Tab */}
            {activeTab === "membership" && (
              <MembershipTab 
                currentPlan={currentPlan}
                membershipTier={membershipTier}
                onChangePlan={handleOpenChangePlanModal}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedWorkout && (
        <WorkoutDetailsModal 
          workout={selectedWorkout} 
          onClose={handleCloseWorkoutModal} 
          onBookSession={handleBookSession}
        />
      )}

      {/* {selectedProgram && (
        <PaymentConfirmationModal 
          program={selectedProgram}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )} */}

      {showChangePlanModal && (
        <ChangePlanModal 
          onClose={handleCloseChangePlanModal}
          onSuccess={handlePlanChangeSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;