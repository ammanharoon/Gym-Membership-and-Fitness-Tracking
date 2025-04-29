import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Calendar, User, Dumbbell, Plus, X, Trash2 } from "lucide-react";
import axios from "axios";

export default function TrainerDashboard() {
  const [trainer, setTrainer] = useState(null);
  const [clients, setClients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    duration: "",
    sessions: [],
  });
  const [sessionCount, setSessionCount] = useState(2);

  useEffect(() => {
    setNewProgram((prev) => ({
      ...prev,
      sessions: Array(sessionCount)
        .fill()
        .map((_, index) => ({ id: index + 1, description: "" })),
    }));
  }, [sessionCount]);

  useEffect(() => {
    const trainerId = localStorage.getItem("trainerId");
    setNewProgram((prev) => ({
      ...prev,
      sessions: Array(sessionCount)
        .fill()
        .map((_, index) => ({ id: index + 1, description: "" })),
    }));

    const fetchDashboardData = async () => {
      try {
        const [profileRes, programsRes, sessionsRes, clientsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/trainer-profile?trainerId=${trainerId}`),
          axios.get(`http://localhost:5000/api/trainer-programs?trainerId=${trainerId}`),
          axios.get(`http://localhost:5000/api/trainer-sessions?trainerId=${trainerId}`),
          axios.get(`http://localhost:5000/api/trainer-clients?trainerId=${trainerId}`)
        ]);

        setTrainer(profileRes.data || null);
        setPrograms(programsRes.data || []);
        setSessions(sessionsRes.data || []);
        setClients(clientsRes.data || []);

      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
        setTrainer(null);
        setPrograms([]);
        setSessions([]);
        setClients([]);
      }
    };

    fetchDashboardData();
  }, []);


  const handleAddProgram = () => {
    const trainerId = localStorage.getItem("trainerId");
    if (!trainerId) {
      alert("Trainer ID is missing. Please log in again.");
      return;
    }
  
    // Map session inputs and filter out empty descriptions
    const sessionDescriptions = newProgram.sessions
      .map((session) => session.description || "")
      .filter((desc) => desc !== ""); // Only include non-empty descriptions
  
    // Debug the session descriptions
    console.log("Session Descriptions:", sessionDescriptions);
  
    // Ensure at least one session has a description
    if (sessionDescriptions.length === 0) {
      alert("At least one session description is required.");
      return;
    }
  
    axios
      .post("http://localhost:5000/api/add-program", {
        trainerId,
        programName: newProgram.name,
        description: newProgram.description,
        duration: newProgram.duration,
        sessions: sessionDescriptions, // Send as ["abs", "legs"]
      })
      .then((response) => {
        alert("Program added successfully!");
        // Update programs state with the newly created program
        setPrograms((prevPrograms) => [...prevPrograms, response.data.program]);
        setNewProgram({
          name: "",
          description: "",
          duration: "",
          sessions: Array(sessionCount)
            .fill()
            .map((_, index) => ({ id: index + 1, description: "" })), // Reset with current session count
        });
      })
      .catch((error) => {
        console.error("❌ Error adding program:", error);
        const errorMessage = error.response?.data?.message || "An error occurred while adding the program.";
        alert(errorMessage);
      });
  };


  const handleRemoveProgram = async (programId) => {
    const trainerId = localStorage.getItem("trainerId");

    try {
      const response = await axios.post("http://localhost:5000/api/remove-program", {
        trainerId: parseInt(trainerId, 10),
        programId: parseInt(programId, 10)
      });

      alert("Program removed successfully!");
      setPrograms(prevPrograms => prevPrograms.filter(program => program.id !== programId));
    } catch (error) {
      console.error("❌ Error removing program:", error.response?.data || error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewProgram(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSessionCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (count < 1 || count > 5) return; // Enforce min/max constraints
    setSessionCount(count);
  };

  const handleExerciseChange = (sessionId, event) => {
    const { value } = event.target;
    setNewProgram((prev) => ({
      ...prev,
      sessions: prev.sessions.map((session) =>
        session.id === sessionId ? { ...session, description: value } : session
      ),
    }));
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-6">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-gray-700 overflow-x-auto">
        <button 
          onClick={() => handleTabChange("overview")} 
          className={`py-3 px-6 font-medium transition-colors whitespace-nowrap rounded-t-lg ${
            activeTab === "overview" 
              ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400" 
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          }`}
        >
          Overview
        </button>
        <button 
          onClick={() => handleTabChange("programs")} 
          className={`py-3 px-6 font-medium transition-colors whitespace-nowrap rounded-t-lg ${
            activeTab === "programs" 
              ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400" 
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          }`}
        >
          My Programs
        </button>
        <button 
          onClick={() => handleTabChange("clients")} 
          className={`py-3 px-6 font-medium transition-colors whitespace-nowrap rounded-t-lg ${
            activeTab === "clients" 
              ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400" 
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          }`}
        >
          My Clients
        </button>
        <button 
          onClick={() => handleTabChange("add-program")} 
          className={`py-3 px-6 font-medium transition-colors whitespace-nowrap rounded-t-lg ${
            activeTab === "add-program" 
              ? "bg-gray-800 text-purple-400 border-b-2 border-purple-400" 
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          }`}
        >
          Add Program
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Welcome, {trainer?.name || "Trainer"}!
          </h1>

          {/* Trainer Profile Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-purple-300">
              <User className="mr-2 h-5 w-5" />
              Trainer Profile
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 space-y-3">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">{trainer?.name}</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Email:</span> {trainer?.email || "Not available"}</p>
                    <p><span className="text-gray-400">Phone:</span> {trainer?.phone || "Not available"}</p>
                    <p><span className="text-gray-400">Expertise:</span> {trainer?.expertise || "Not specified"}</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="md:w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg shadow-md border border-gray-600 flex flex-col justify-between">
                  <h3 className="text-sm text-gray-400">Total Clients</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-2xl font-bold text-white">{clients?.length || 0}</p>
                    <User className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg shadow-md border border-gray-600 flex flex-col justify-between">
                  <h3 className="text-sm text-gray-400">Upcoming Sessions</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-2xl font-bold text-white">{sessions?.length || 0}</p>
                    <Calendar className="w-8 h-8 text-pink-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg shadow-md border border-gray-600 flex flex-col justify-between">
                  <h3 className="text-sm text-gray-400">Profile Status</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-bold text-white">{trainer?.availability ? "Available" : "Busy"}</p>
                    <Dumbbell className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Programs */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center text-purple-300">
                <Dumbbell className="mr-2 h-5 w-5" />
                Recent Programs
              </h2>
              <button 
                onClick={() => handleTabChange("programs")}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center"
              >
                View All
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            {programs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.slice(0, 2).map(program => (
                  <div key={program.id} className="bg-gray-700 rounded-lg shadow-md p-5 border border-gray-600 hover:border-purple-500 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-white mb-2">{program.name}</h3>
                    <p className="text-gray-300 mb-3 text-sm line-clamp-2">{program.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Duration: {program.duration}</span>
                      <button 
                        onClick={() => handleRemoveProgram(program.id)}
                        className="p-1.5 bg-gray-600 hover:bg-red-600 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No programs available.</p>
                <button 
                  onClick={() => handleTabChange("add-program")} 
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Program
                </button>
              </div>
            )}
          </div>

          {/* Recent Clients */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center text-purple-300">
                <User className="mr-2 h-5 w-5" />
                Recent Clients
              </h2>
              <button 
                onClick={() => handleTabChange("clients")}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center"
              >
                View All
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            {clients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.slice(0, 2).map(client => (
                  <div key={client.id || client.user_id} className="bg-gray-700 rounded-lg shadow-md p-5 border border-gray-600 hover:border-purple-500 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {(client.name?.[0] || client.user_name?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-white">{client.name || client.user_name}</h3>
                        <p className="text-gray-400 text-sm">{client.email || client.user_email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No booked clients.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Programs Tab */}
      {activeTab === "programs" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">My Programs</h2>
            <button 
              onClick={() => handleTabChange("add-program")}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Program
            </button>
          </div>

          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map(program => (
                <div key={program.id} className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-3">{program.name}</h3>
                  <p className="text-gray-300 mb-4">{program.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Duration: {program.duration}</span>
                    <button 
                      onClick={() => handleRemoveProgram(program.id)}
                      className="px-4 py-2 bg-gray-700 hover:bg-red-600 rounded-lg text-white transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-xl p-12 text-center border border-gray-700">
              <Dumbbell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Programs Yet</h3>
              <p className="text-gray-400 mb-6">You haven't created any training programs yet.</p>
              <button 
                onClick={() => handleTabChange("add-program")}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Program
              </button>
            </div>
          )}
        </>
      )}

      {/* Clients Tab */}
      {activeTab === "clients" && (
        <>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6">Booked Clients</h2>
          {clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div key={client.id || client.user_id} className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        {(client.name?.[0] || client.user_name?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-white">{client.name || client.user_name}</h3>
                        <p className="text-gray-400">{client.email || client.user_email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-xl p-12 text-center border border-gray-700">
              <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Clients Yet</h3>
              <p className="text-gray-400">You don't have any clients assigned to you yet.</p>
            </div>
          )}
        </>
      )}

      {/* Add Program Tab */}
      {activeTab === "add-program" && (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-6">
            <h2 className="text-3xl font-bold text-white mb-2">Create New Program</h2>
            <p className="text-violet-100 opacity-90">Design a personalized workout program for your clients</p>
          </div>
          
          <div className="p-8">
            {/* Progress bar */}
            <div className="mb-10 px-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Your progress</span>
                <span className="text-sm font-medium text-violet-400">
                  {Math.floor(((newProgram.name ? 1 : 0) + (newProgram.description ? 1 : 0) + 
                   (newProgram.duration ? 1 : 0) + (newProgram.sessions.some(s => s.description) ? 1 : 0)) / 4 * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((newProgram.name ? 1 : 0) + (newProgram.description ? 1 : 0) + 
                  (newProgram.duration ? 1 : 0) + (newProgram.sessions.some(s => s.description) ? 1 : 0)) / 4 * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Program Name */}
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 hover:border-violet-500 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg mr-4">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Program Name</h3>
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter a catchy, descriptive name..."
                  value={newProgram.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="mt-3 text-gray-400 text-sm flex items-start">
                  <svg className="w-4 h-4 text-violet-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  Good program names are specific and memorable, like "12-Week Strength Builder" or "Ultimate Fat Loss Challenge"
                </p>
              </div>
              
              {/* Program Description */}
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 hover:border-violet-500 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg mr-4">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Program Description</h3>
                </div>
                <textarea
                  name="description"
                  placeholder="Describe the program goals, target audience, and expected results..."
                  value={newProgram.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                ></textarea>
                <p className="mt-3 text-gray-400 text-sm flex items-start">
                  <svg className="w-4 h-4 text-violet-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  Include details about intensity, fitness level requirements, and what clients will achieve
                </p>
              </div>
              
              {/* Program Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 hover:border-violet-500 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg mr-4">
                      <span className="text-lg font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Program Duration</h3>
                  </div>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g., 8 weeks, 3 months"
                    value={newProgram.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <p className="mt-3 text-gray-400 text-sm flex items-start">
                    <svg className="w-4 h-4 text-violet-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    Most effective programs run between 4-12 weeks
                  </p>
                </div>
                
                {/* Number of Sessions */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 hover:border-violet-500 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg mr-4">
                      <span className="text-lg font-bold">4</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Number of Sessions</h3>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} 
                        type="button"
                        onClick={() => setSessionCount(num)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                          sessionCount === num 
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg scale-105' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm flex items-start">
                    <svg className="w-4 h-4 text-violet-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    Select how many different workout sessions in your program
                  </p>
                </div>
              </div>
              
              {/* Session Details */}
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 hover:border-violet-500 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg mr-4">
                    <span className="text-lg font-bold">5</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Session Details</h3>
                </div>
                
                <div className="space-y-5">
                  {newProgram.sessions.map((session) => (
                    <div key={session.id} className="relative bg-gray-700/60 backdrop-blur-sm rounded-xl p-5 border border-gray-600 hover:border-violet-500 transition-all duration-300">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {session.id}
                      </div>
                      <h5 className="text-white font-bold mb-3 pl-6">Session {session.id}</h5>
                      <input
                        type="text"
                        placeholder="Enter exercises (comma-separated)"
                        value={session.description}
                        onChange={(e) => handleExerciseChange(session.id, e)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                      <p className="mt-2 text-gray-400 text-sm">Example: "Bench Press 3x10, Squats 4x8, Planks 3x30s"</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={handleAddProgram}
                  disabled={!newProgram.name || !newProgram.description || !newProgram.duration || !newProgram.sessions.some(s => s.description)}
                  className={`w-full py-4 rounded-xl text-xl font-bold transition-all duration-300 flex items-center justify-center ${
                    !newProgram.name || !newProgram.description || !newProgram.duration || !newProgram.sessions.some(s => s.description)
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg transform hover:translate-y-[-2px]'
                  }`}
                >
                  {!newProgram.name || !newProgram.description || !newProgram.duration || !newProgram.sessions.some(s => s.description)
                    ? 'Complete All Fields'
                    : 'Create Program'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}