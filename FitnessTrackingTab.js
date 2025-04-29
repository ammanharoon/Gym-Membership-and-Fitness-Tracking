import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CheckCircle, PlusCircle, Edit2, Trash2, Activity, TrendingUp, Weight, Droplet } from 'lucide-react';
import axios from "axios";

const API_URL = 'http://localhost:5000/api';

const FitnessTrackingTab = ({ userId, token }) => {
  // State for fitness metrics
  const [metrics, setMetrics] = useState({
    weight: [],
    bodyFat: [],
    workoutLogs: [],
    goals: [],
    waterIntake: []
  });
  
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [loading, setLoading] = useState(true);
  const [showAddMetricForm, setShowAddMetricForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [showAddWorkoutLogForm, setShowAddWorkoutLogForm] = useState(false);
  const [error, setError] = useState("");
  
  // Form states
  const [newMetricValue, setNewMetricValue] = useState('');
  const [newGoalData, setNewGoalData] = useState({
    type: 'weight',
    target: '',
    deadline: '',
    notes: ''
  });
  const [newWorkoutLog, setNewWorkoutLog] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newWaterIntake, setNewWaterIntake] = useState('');
  
  // Dummy data for development purposes - will be replaced with API calls
  // useEffect(() => {
  //   // Simulate API fetch
  //   setTimeout(() => {
  //     const dummyData = generateDummyData();
  //     setMetrics(dummyData);
  //     setLoading(false);
  //   }, 1000);
  // }, [userId]);

  // Fetch data when component mounts or when token changes
  useEffect(() => {
    fetchFitnessData();
  }, [token]);

  const fetchFitnessData = async () => {
    if (!token) {
      setError("Authentication token is missing");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Use the fitness tracking service to get metrics
      const data = await fitnessTrackingService.getAllMetrics(token);
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching fitness data:", error);
      setError("Could not load fitness data. Please try again later.");
      
      // Fallback to dummy data for development only
      if (process.env.NODE_ENV === 'development') {
        console.log("Using dummy data for development");
        const dummyData = generateDummyData();
        setMetrics(dummyData);
      }
    } finally {
      setLoading(false);
    } 
  };
  
  const generateDummyData = () => {
    // Generate last 30 days of dummy data
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const weightData = [];
    const bodyFatData = [];
    const waterIntakeData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Only add data for some random days to make it realistic
      if (Math.random() > 0.3) {
        weightData.push({
          date: dateStr,
          value: (70 + Math.random() * 5).toFixed(1)
        });
      }
      
      if (Math.random() > 0.4) {
        bodyFatData.push({
          date: dateStr,
          value: (15 + Math.random() * 3).toFixed(1)
        });
      }

      if (Math.random() > 0.2) {
        waterIntakeData.push({
          date: dateStr,
          value: Math.floor(1500 + Math.random() * 1000)
        });
      }
    }
    
    return {
      weight: weightData,
      bodyFat: bodyFatData,
      workoutLogs: [
        {
          id: 1,
          date: '2025-04-25',
          exercises: [
            { name: 'Bench Press', sets: 3, reps: 10, weight: 70 },
            { name: 'Squats', sets: 4, reps: 8, weight: 100 },
            { name: 'Pull-ups', sets: 3, reps: 12, weight: 0 }
          ],
          duration: 65,
          notes: 'Great chest day, increased bench press weight by 5kg'
        },
        {
          id: 2,
          date: '2025-04-23',
          exercises: [
            { name: 'Deadlift', sets: 3, reps: 8, weight: 120 },
            { name: 'Barbell Rows', sets: 3, reps: 10, weight: 60 },
            { name: 'Bicep Curls', sets: 3, reps: 12, weight: 15 }
          ],
          duration: 55,
          notes: 'Focused on back and biceps, felt strong'
        }
      ],
      goals: [
        {
          id: 1,
          type: 'weight',
          target: '75',
          deadline: '2025-06-30',
          progress: 68,
          notes: 'Bulk to 75kg'
        },
        {
          id: 2,
          type: 'bodyFat',
          target: '12',
          deadline: '2025-07-15',
          progress: 32,
          notes: 'Reduce body fat percentage'
        }
      ],
      waterIntake: waterIntakeData
    };
  };
  
  // Function for handling metric addition
  // const handleAddMetric = (e) => {
  //   e.preventDefault();
    
  //   if (!newMetricValue) return;
    
  //   const today = new Date().toISOString().split('T')[0];
    
  //   if (selectedMetric === 'weight' || selectedMetric === 'bodyFat') {
  //     const newEntry = {
  //       date: today,
  //       value: newMetricValue
  //     };
      
  //     setMetrics(prev => ({
  //       ...prev,
  //       [selectedMetric]: [...prev[selectedMetric], newEntry].sort((a, b) => 
  //         new Date(a.date) - new Date(b.date)
  //       )
  //     }));
  //   } else if (selectedMetric === 'waterIntake') {
  //     const newEntry = {
  //       date: today,
  //       value: newMetricValue
  //     };
      
  //     setMetrics(prev => ({
  //       ...prev,
  //       waterIntake: [...prev.waterIntake, newEntry].sort((a, b) => 
  //         new Date(a.date) - new Date(b.date)
  //       )
  //     }));
  //   }
    
  //   setNewMetricValue('');
  //   setShowAddMetricForm(false);
  // };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    
    if (!newMetricValue) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      let endpoint, newEntry;
      
      if (selectedMetric === 'weight') {
        endpoint = "/api/fitness/weight";
      } else if (selectedMetric === 'bodyFat') {
        endpoint = "/api/fitness/body-fat";
      } else {
        throw new Error("Invalid metric type");
      }
      
      // Make API call to add metric
      const response = await axios.post(
        endpoint, 
        { value: newMetricValue, date: today },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      newEntry = response.data;
      
      // Update local state
      setMetrics(prev => ({
        ...prev,
        [selectedMetric]: [...prev[selectedMetric], newEntry].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        )
      }));
      
      // Reset form
      setNewMetricValue('');
      setShowAddMetricForm(false);
    } catch (error) {
      console.error(`Error adding ${selectedMetric} entry:`, error);
      alert(`Failed to add ${selectedMetric} entry. Please try again.`);
    }
  };
  
  // Function for handling workout log addition
  // const handleAddWorkoutLog = (e) => {
  //   e.preventDefault();
    
  //   const exercisesArr = newWorkoutLog.exercise.split(',').map(ex => {
  //     const parts = ex.trim().split(' ');
  //     const weight = parts.pop();
  //     const reps = parts.pop();
  //     const sets = parts.pop();
  //     const name = parts.join(' ');
      
  //     return {
  //       name,
  //       sets: parseInt(sets),
  //       reps: parseInt(reps),
  //       weight: parseInt(weight)
  //     };
  //   });
    
  //   const newLog = {
  //     id: Date.now(),
  //     date: newWorkoutLog.date,
  //     exercises: exercisesArr,
  //     duration: parseInt(newWorkoutLog.duration),
  //     notes: newWorkoutLog.notes
  //   };
    
  //   setMetrics(prev => ({
  //     ...prev,
  //     workoutLogs: [newLog, ...prev.workoutLogs]
  //   }));
    
  //   setNewWorkoutLog({
  //     exercise: '',
  //     sets: '',
  //     reps: '',
  //     weight: '',
  //     duration: '',
  //     notes: '',
  //     date: new Date().toISOString().split('T')[0]
  //   });
    
  //   setShowAddWorkoutLogForm(false);
  // };

  const handleAddWorkoutLog = async (e) => {
    e.preventDefault();
    
    if (!newWorkoutLog.exercise || !newWorkoutLog.duration) {
      alert("Please fill in all required fields.");
      return;
    }
    
    try {
      // Parse exercises from the form input
      const exercisesArr = newWorkoutLog.exercise.split(',').map(ex => {
        const parts = ex.trim().split(' ');
        const weight = parts.pop();
        const reps = parts.pop();
        const sets = parts.pop();
        const name = parts.join(' ');
        
        return {
          name,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight)
        };
      });
      
      // Prepare workout data
      const workoutData = {
        date: newWorkoutLog.date,
        duration: parseInt(newWorkoutLog.duration),
        notes: newWorkoutLog.notes || "",
        exercises: exercisesArr
      };
      
      // Make API call to add workout log
      const response = await axios.post(
        "/api/fitness/workout-logs", 
        workoutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const newLog = response.data;
      
      // Update local state
      setMetrics(prev => ({
        ...prev,
        workoutLogs: [newLog, ...prev.workoutLogs]
      }));
      
      // Reset form
      setNewWorkoutLog({
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
        duration: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddWorkoutLogForm(false);
    } catch (error) {
      console.error("Error adding workout log:", error);
      alert("Failed to add workout log. Please try again.");
    }
  };
  
  // Function for handling goal addition
  // const handleAddGoal = (e) => {
  //   e.preventDefault();
    
  //   const newGoal = {
  //     id: Date.now(),
  //     type: newGoalData.type,
  //     target: newGoalData.target,
  //     deadline: newGoalData.deadline,
  //     progress: 0,
  //     notes: newGoalData.notes
  //   };
    
  //   setMetrics(prev => ({
  //     ...prev,
  //     goals: [...prev.goals, newGoal]
  //   }));
    
  //   setNewGoalData({
  //     type: 'weight',
  //     target: '',
  //     deadline: '',
  //     notes: ''
  //   });
    
  //   setShowAddGoalForm(false);
  // };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    
    if (!newGoalData.type || !newGoalData.target || !newGoalData.notes) {
      alert("Please fill in all required fields.");
      return;
    }
    
    try {
      // Make API call to add goal
      const response = await axios.post(
        "/api/fitness/goals", 
        newGoalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const newGoal = response.data;
      
      // Update local state
      setMetrics(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));
      
      // Reset form
      setNewGoalData({
        type: 'weight',
        target: '',
        deadline: '',
        notes: ''
      });
      setShowAddGoalForm(false);
    } catch (error) {
      console.error("Error adding goal:", error);
      alert("Failed to add goal. Please try again.");
    }
  };
  
  
  // Calculate goal progress
  // const calculateGoalProgress = (goal) => {
  //   if (goal.type === 'weight') {
  //     const latestWeight = metrics.weight.length > 0 ? metrics.weight[metrics.weight.length - 1].value : 0;
  //     return Math.min(Math.floor((latestWeight / goal.target) * 100), 100);
  //   }
  //   else if (goal.type === 'bodyFat') {
  //     const latestBodyFat = metrics.bodyFat.length > 0 ? metrics.bodyFat[metrics.bodyFat.length - 1].value : 0;
  //     return Math.min(Math.floor((latestBodyFat / goal.target) * 100), 100);
  //   }
    
  //   return goal.progress; // Return existing progress for other goal types
  // };

  const calculateGoalProgress = (goal) => {
    if (goal.progress !== undefined) {
      return goal.progress;
    }
    
    // Calculate progress based on current metrics if not set
    if (goal.type === 'weight') {
      const latestWeight = metrics.weight.length > 0 ? 
        parseFloat(metrics.weight[metrics.weight.length - 1].value) : 0;
      return Math.min(Math.floor((latestWeight / parseFloat(goal.target)) * 100), 100);
    }
    else if (goal.type === 'bodyFat') {
      const latestBodyFat = metrics.bodyFat.length > 0 ? 
        parseFloat(metrics.bodyFat[metrics.bodyFat.length - 1].value) : 0;
      return Math.min(Math.floor((latestBodyFat / parseFloat(goal.target)) * 100), 100);
    }
    
    return 0;
  };
  
  // Function to delete a workout log
  // const handleDeleteWorkoutLog = (logId) => {
  //   setMetrics(prev => ({
  //     ...prev,
  //     workoutLogs: prev.workoutLogs.filter(log => log.id !== logId)
  //   }));
  // };

  const handleDeleteWorkoutLog = async (logId) => {
    try {
      // Make API call to delete workout log
      await axios.delete(`/api/fitness/workout-logs/${logId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setMetrics(prev => ({
        ...prev,
        workoutLogs: prev.workoutLogs.filter(log => log.id !== logId)
      }));
    } catch (error) {
      console.error("Error deleting workout log:", error);
      alert("Failed to delete workout log. Please try again.");
    }
  };
  
  // Function to delete a goal
  // const handleDeleteGoal = (goalId) => {
  //   setMetrics(prev => ({
  //     ...prev,
  //     goals: prev.goals.filter(goal => goal.id !== goalId)
  //   }));
  // };

  const handleDeleteGoal = async (goalId) => {
    try {
      // Make API call to delete goal
      await axios.delete(`/api/fitness/goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setMetrics(prev => ({
        ...prev,
        goals: prev.goals.filter(goal => goal.id !== goalId)
      }));
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  };
  
  // Function to handle water intake addition
  // const handleAddWaterIntake = (e) => {
  //   e.preventDefault();
    
  //   if (!newWaterIntake) return;
    
  //   const today = new Date().toISOString().split('T')[0];
    
  //   // Check if entry for today already exists
  //   const entryIndex = metrics.waterIntake.findIndex(entry => entry.date === today);
    
  //   if (entryIndex >= 0) {
  //     // Update existing entry
  //     const updatedWaterIntake = [...metrics.waterIntake];
  //     updatedWaterIntake[entryIndex] = {
  //       ...updatedWaterIntake[entryIndex],
  //       value: parseInt(updatedWaterIntake[entryIndex].value) + parseInt(newWaterIntake)
  //     };
      
  //     setMetrics(prev => ({
  //       ...prev,
  //       waterIntake: updatedWaterIntake
  //     }));
  //   } else {
  //     // Add new entry
  //     const newEntry = {
  //       date: today,
  //       value: parseInt(newWaterIntake)
  //     };
      
  //     setMetrics(prev => ({
  //       ...prev,
  //       waterIntake: [...prev.waterIntake, newEntry].sort((a, b) => 
  //         new Date(a.date) - new Date(b.date)
  //       )
  //     }));
  //   }
    
  //   setNewWaterIntake('');
  // };

  const handleAddWaterIntake = async (e) => {
    e.preventDefault();
    
    if (!newWaterIntake || isNaN(parseInt(newWaterIntake))) {
      alert("Please enter a valid water intake amount.");
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Make API call to add water intake
      const response = await axios.post(
        "/api/fitness/water-intake", 
        { value: parseInt(newWaterIntake), date: today },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = response.data;
      
      // Check if entry for today already exists in our local state
      const entryIndex = metrics.waterIntake.findIndex(entry => entry.date === today);
      
      if (entryIndex >= 0) {
        // Update existing entry
        const updatedWaterIntake = [...metrics.waterIntake];
        updatedWaterIntake[entryIndex] = result;
        
        setMetrics(prev => ({
          ...prev,
          waterIntake: updatedWaterIntake
        }));
      } else {
        // Add new entry
        setMetrics(prev => ({
          ...prev,
          waterIntake: [...prev.waterIntake, result].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
          )
        }));
      }
      
      // Reset form
      setNewWaterIntake('');
    } catch (error) {
      console.error("Error adding water intake:", error);
      alert("Failed to add water intake. Please try again.");
    }
  };
  
  // Get the chart data for current selected metric
  const getChartData = () => {
    if (selectedMetric === 'weight' || selectedMetric === 'bodyFat' || selectedMetric === 'waterIntake') {
      return metrics[selectedMetric].map(item => ({
        date: item.date,
        value: parseFloat(item.value)
      }));
    }
    return [];
  };
  
  // Get total workout duration for the current month
  const getTotalWorkoutDuration = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return metrics.workoutLogs
      .filter(log => new Date(log.date) >= monthStart)
      .reduce((total, log) => total + log.duration, 0);
  };
  
  // Get total workouts for the current month
  const getTotalWorkouts = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return metrics.workoutLogs
      .filter(log => new Date(log.date) >= monthStart)
      .length;
  };

  // Get latest water intake
  const getLatestWaterIntake = () => {
    if (metrics.waterIntake.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = metrics.waterIntake.find(entry => entry.date === today);
    
    return todayEntry ? todayEntry.value : 0;
  };
  
  // Get the latest value for a metric
  const getLatestMetricValue = (metricName) => {
    if (!metrics[metricName] || metrics[metricName].length === 0) return "N/A";
    
    const sortedData = [...metrics[metricName]].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return sortedData[0].value;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 bg-gray-900 text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Weight Card */}
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm text-gray-400">Current Weight</h3>
              <p className="text-2xl font-bold text-white">{getLatestMetricValue('weight')} kg</p>
            </div>
            <Weight className="h-10 w-10 text-purple-500" />
          </div>
          <button
            onClick={() => {
              setSelectedMetric('weight');
              setShowAddMetricForm(true);
            }}
            className="mt-3 w-full text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center"
          >
            <PlusCircle className="h-3 w-3 mr-1" /> Add Weight Entry
          </button>
        </div>
        
        {/* Body Fat Card */}
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm text-gray-400">Body Fat</h3>
              <p className="text-2xl font-bold text-white">{getLatestMetricValue('bodyFat')}%</p>
            </div>
            <Activity className="h-10 w-10 text-purple-500" />
          </div>
          <button
            onClick={() => {
              setSelectedMetric('bodyFat');
              setShowAddMetricForm(true);
            }}
            className="mt-3 w-full text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center"
          >
            <PlusCircle className="h-3 w-3 mr-1" /> Add Body Fat Entry
          </button>
        </div>
        
        {/* Workout Stats Card */}
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm text-gray-400">Month Workouts</h3>
              <p className="text-2xl font-bold text-white">{getTotalWorkouts()}</p>
              <p className="text-xs text-gray-400">Total: {getTotalWorkoutDuration()} mins</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-500" />
          </div>
          <button
            onClick={() => setShowAddWorkoutLogForm(true)}
            className="mt-3 w-full text-xs text-purple-400 hover:text-purple-300 flex items-center justify-center"
          >
            <PlusCircle className="h-3 w-3 mr-1" /> Log Workout
          </button>
        </div>
        
        {/* Water Intake Card */}
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm text-gray-400">Today's Water</h3>
              <p className="text-2xl font-bold text-white">{getLatestWaterIntake()} ml</p>
            </div>
            <Droplet className="h-10 w-10 text-purple-500" />
          </div>
          <div className="mt-2">
            <form onSubmit={handleAddWaterIntake} className="flex">
              <input
                type="number"
                placeholder="Add ml"
                value={newWaterIntake}
                onChange={(e) => setNewWaterIntake(e.target.value)}
                className="mr-2 p-1 border rounded text-xs flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                min="50"
                step="50"
              />
              <button 
                type="submit"
                className="text-xs bg-purple-700 text-white rounded px-2 py-1 hover:bg-purple-600"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Tabs for different metrics */}
      <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                selectedMetric === 'weight' 
                  ? 'text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-purple-300'
              }`}
              onClick={() => setSelectedMetric('weight')}
            >
              Weight
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                selectedMetric === 'bodyFat' 
                  ? 'text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-purple-300'
              }`}
              onClick={() => setSelectedMetric('bodyFat')}
            >
              Body Fat
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                selectedMetric === 'waterIntake' 
                  ? 'text-purple-400 border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-purple-300'
              }`}
              onClick={() => setSelectedMetric('waterIntake')}
            >
              Water Intake
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis 
                  stroke="#ccc"
                  label={
                    selectedMetric === 'weight' 
                      ? { value: 'kg', angle: -90, position: 'insideLeft', style: { fill: '#ccc' } } 
                      : selectedMetric === 'bodyFat' 
                        ? { value: '%', angle: -90, position: 'insideLeft', style: { fill: '#ccc' } }
                        : { value: 'ml', angle: -90, position: 'insideLeft', style: { fill: '#ccc' } }
                  }
                />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }} />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#a78bfa" 
                  name={
                    selectedMetric === 'weight' 
                      ? 'Weight (kg)' 
                      : selectedMetric === 'bodyFat' 
                        ? 'Body Fat (%)' 
                        : 'Water Intake (ml)'
                  }
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Add entry form for the selected metric */}
          {showAddMetricForm && (
            <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
              <h3 className="text-lg font-medium mb-3 text-white">
                Add {selectedMetric === 'weight' ? 'Weight' : 'Body Fat'} Entry
              </h3>
              <form onSubmit={handleAddMetric} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    {selectedMetric === 'weight' ? 'Weight (kg)' : 'Body Fat (%)'}
                  </label>
                  <input
                    type="number"
                    step={selectedMetric === 'weight' ? '0.1' : '0.1'}
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    placeholder={selectedMetric === 'weight' ? 'e.g. 75.5' : 'e.g. 15.2'}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMetricForm(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 text-sm font-medium text-white bg-purple-700 border border-transparent rounded-md shadow-sm hover:bg-purple-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Goals Section */}
      <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Fitness Goals</h2>
          <button
            onClick={() => setShowAddGoalForm(true)}
            className="text-sm bg-purple-700 text-white px-3 py-1 rounded-md hover:bg-purple-600 flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Goal
          </button>
        </div>
        
        {metrics.goals.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No goals set yet. Add your first fitness goal!</p>
        ) : (
          <div className="space-y-4">
            {metrics.goals.map(goal => (
              <div key={goal.id} className="border border-gray-700 rounded-lg p-3 relative bg-gray-900">
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center">
                  <div className="flex-grow">
                    <h3 className="font-medium text-white">{goal.notes}</h3>
                    <p className="text-sm text-gray-400">
                      Target: {goal.target} {goal.type === 'weight' ? 'kg' : goal.type === 'bodyFat' ? '%' : ''}
                      {goal.deadline && ` • Deadline: ${goal.deadline}`}
                    </p>
                    <div className="mt-2 h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-purple-600 rounded-full"
                        style={{ width: `${calculateGoalProgress(goal)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {calculateGoalProgress(goal)}% complete
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Goal Form */}
        {showAddGoalForm && (
          <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h3 className="text-lg font-medium mb-3 text-white">Add New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300">Goal Type</label>
                <select
                  value={newGoalData.type}
                  onChange={(e) => setNewGoalData({ ...newGoalData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                >
                  <option value="weight">Weight</option>
                  <option value="bodyFat">Body Fat</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Target</label>
                <input
                  type="text"
                  value={newGoalData.target}
                  onChange={(e) => setNewGoalData({ ...newGoalData, target: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="e.g. 70 (for weight) or 15 (for body fat %)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Deadline (optional)</label>
                <input
                  type="date"
                  value={newGoalData.deadline}
                  onChange={(e) => setNewGoalData({ ...newGoalData, deadline: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Notes</label>
                <input
                  type="text"
                  value={newGoalData.notes}
                  onChange={(e) => setNewGoalData({ ...newGoalData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="e.g. Reach 70kg by summer"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoalForm(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-medium text-white bg-purple-700 border border-transparent rounded-md shadow-sm hover:bg-purple-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {/* Workout Logs Section */}
      <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-white">Workout Logs</h2>
          <button
            onClick={() => setShowAddWorkoutLogForm(true)}
            className="text-sm bg-purple-700 text-white px-3 py-1 rounded-md hover:bg-purple-600 flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Log Workout
          </button>
        </div>
        
        {metrics.workoutLogs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No workouts logged yet. Log your first workout!</p>
        ) : (
          <div className="space-y-4">
            {metrics.workoutLogs.map(log => (
              <div key={log.id} className="border border-gray-700 rounded-lg p-3 relative bg-gray-900">
                <button
                  onClick={() => handleDeleteWorkoutLog(log.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-start">
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-white">Workout on {log.date}</h3>
                      <span className="text-sm text-gray-400">{log.duration} mins</span>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-300">Exercises:</h4>
                      <ul className="mt-1 space-y-1">
                        {log.exercises.map((exercise, index) => (
                          <li key={index} className="text-sm text-gray-400">
                            {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                          </li>
                        ))}
                      </ul>
                    </div>
                    {log.notes && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-300">Notes:</h4>
                        <p className="text-sm text-gray-400">{log.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Workout Log Form */}
        {showAddWorkoutLogForm && (
          <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h3 className="text-lg font-medium mb-3 text-white">Log Workout</h3>
            <form onSubmit={handleAddWorkoutLog} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300">Date</label>
                <input
                  type="date"
                  value={newWorkoutLog.date}
                  onChange={(e) => setNewWorkoutLog({ ...newWorkoutLog, date: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Exercises (Format: Name Sets Reps Weight, separated by commas)
                </label>
                <textarea
                  value={newWorkoutLog.exercise}
                  onChange={(e) => setNewWorkoutLog({ ...newWorkoutLog, exercise: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="e.g. Bench Press 3 10 70, Squats 4 8 100"
                  rows={3}
                  required
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  Example: "Bench Press 3 10 70" means 3 sets of 10 reps at 70kg
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Duration (minutes)</label>
                <input
                  type="number"
                  value={newWorkoutLog.duration}
                  onChange={(e) => setNewWorkoutLog({ ...newWorkoutLog, duration: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Notes (optional)</label>
                <textarea
                  value={newWorkoutLog.notes}
                  onChange={(e) => setNewWorkoutLog({ ...newWorkoutLog, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="How did the workout feel? Any PRs?"
                  rows={2}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddWorkoutLogForm(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md shadow-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-medium text-white bg-purple-700 border border-transparent rounded-md shadow-sm hover:bg-purple-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessTrackingTab;