import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Dumbbell, CreditCard, TrendingUp, LogOut, User, Activity, Settings, Key, Trash2, Edit } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [stats, setStats] = useState({
    userCount: 0,
    trainerCount: 0,
    programCount: 0,
    membershipDistribution: [],
    recentUsers: [],
    recentTrainers: []
  });
  
  const [usersData, setUsersData] = useState({ users: [], pagination: {} });
  const [trainersData, setTrainersData] = useState({ trainers: [], pagination: {} });
  const [membershipsData, setMembershipsData] = useState({ memberships: [] });
  
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuthenticated = localStorage.getItem("adminAuthenticated");
    const storedAdminId = localStorage.getItem("adminId");
    
    if (!adminAuthenticated || !storedAdminId) {
      navigate("/admin-login");
      return;
    }
    
    setAdminId(storedAdminId);
    
    Promise.all([
      fetchAdminProfile(storedAdminId),
      fetchDashboardStats(),
      fetchUsers(1, 10, ""),
      fetchTrainers(1, 10, ""),
      fetchMemberships()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error("Error initializing dashboard:", error);
      setLoading(false);
    });
  }, [navigate]);

  const fetchAdminProfile = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/profile?adminId=${id}`);
      setAdminProfile(response.data.admin);
      return response.data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      if (error.response && error.response.status === 401) {
        navigate("/admin-login");
      }
      throw error;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setError("");
      const response = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(response.data);
      return response.data;
    } catch (error) {
      console.error("Stats fetch error:", error);
      setError("Failed to load statistics: " + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const fetchUsers = async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setUsersData(response.data);
      return response.data;
    } catch (error) {
      console.error("Users fetch error:", error);
      setError("Failed to load users: " + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const fetchTrainers = async (page = 1, limit = 10, search = "") => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/trainers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setTrainersData(response.data);
      return response.data;
    } catch (error) {
      console.error("Trainers fetch error:", error);
      setError("Failed to load trainers: " + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const fetchMemberships = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/memberships");
      setMembershipsData(response.data);
      return response.data;
    } catch (error) {
      console.error("Memberships fetch error:", error);
      setError("Failed to load memberships: " + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      await fetchUsers(usersData.pagination.page, usersData.pagination.limit, "");
    } catch (error) {
      console.error("Delete user error:", error);
      setError("Failed to delete user: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTrainer = async (trainerId) => {
    if (!window.confirm("Are you sure you want to delete this trainer?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/trainers/${trainerId}`);
      await fetchTrainers(trainersData.pagination.page, trainersData.pagination.limit, "");
    } catch (error) {
      console.error("Delete trainer error:", error);
      setError("Failed to delete trainer: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminId");
    navigate("/admin-login");
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/admin/change-password", {
        adminId: adminId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.status === 200) {
        setPasswordSuccess("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      }
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordError(error.response?.data?.message || "Failed to change password");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "users":
        return renderUsers();
      case "trainers":
        return renderTrainers();
      case "memberships":
        return renderMemberships();
      case "profile":
        return renderProfileTab();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-6 m-4 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Members" 
            value={stats.userCount || 0} 
            icon={<Users className="h-8 w-8 text-red-500" />} 
            trend="+12% this month"
          />
          <StatCard 
            title="Total Trainers" 
            value={stats.trainerCount || 0} 
            icon={<Dumbbell className="h-8 w-8 text-red-500" />} 
            trend="+5% this month"
          />
          <StatCard 
            title="Active Programs" 
            value={stats.programCount || 0} 
            icon={<Activity className="h-8 w-8 text-red-500" />} 
            trend="+8% this month"
          />
          <StatCard 
            title="Revenue" 
            value={`$${stats.revenue || '0.00'}`} 
            icon={<CreditCard className="h-8 w-8 text-red-500" />} 
            trend="+15% this month"
          />
        </div>

        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Membership Distribution</h2>
          <div className="flex flex-col space-y-4">
            {stats.membershipDistribution && stats.membershipDistribution.length > 0 ? (
              stats.membershipDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.tier} Plan</span>
                    <span className="text-gray-300">{item.count} members</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{
                        width: `${Math.round((item.count / (stats.userCount || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-2">No membership data available</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Recent Members</h2>
            <div className="space-y-4">
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center space-x-4 border-b border-gray-800 pb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-red-500 font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{user.name || "Unknown"}</p>
                      <p className="text-gray-400 text-sm">{user.email || "No email"}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown date"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-2">No users found</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Recent Trainers</h2>
            <div className="space-y-4">
              {stats.recentTrainers && stats.recentTrainers.length > 0 ? (
                stats.recentTrainers.map((trainer, index) => (
                  <div key={index} className="flex items-center space-x-4 border-b border-gray-800 pb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-red-500 font-bold">
                      {trainer.name?.charAt(0).toUpperCase() || "T"}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{trainer.name || "Unknown"}</p>
                      <p className="text-gray-400 text-sm">{trainer.email || "No email"}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {trainer.created_at ? new Date(trainer.created_at).toLocaleDateString() : "Unknown date"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-2">No trainers found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-6 m-4 text-center">
          <p>{error}</p>
          <button 
            onClick={() => fetchUsers(usersData.pagination.page, usersData.pagination.limit, "")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Manage Users</h2>
            <input
              type="text"
              placeholder="Search users..."
              onChange={(e) => fetchUsers(1, usersData.pagination.limit, e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-gray-400">Name</th>
                  <th className="py-3 px-4 text-gray-400">Email</th>
                  <th className="py-3 px-4 text-gray-400">Membership</th>
                  <th className="py-3 px-4 text-gray-400">Join Date</th>
                  <th className="py-3 px-4 text-gray-400">Workouts</th>
                  <th className="py-3 px-4 text-gray-400">Last Active</th>
                  <th className="py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.users && usersData.users.length > 0 ? (
                  usersData.users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="py-3 px-4 text-white">{user.name || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-400">{user.email || "No email"}</td>
                      <td className="py-3 px-4 text-gray-400">{user.membershipTier || "None"}</td>
                      <td className="py-3 px-4 text-gray-400">{user.joinDate || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-400">{user.workoutsCompleted || 0}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {usersData.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-400">
                Showing {usersData.pagination.page} of {usersData.pagination.totalPages} pages
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchUsers(usersData.pagination.page - 1, usersData.pagination.limit, "")}
                  disabled={usersData.pagination.page === 1}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(usersData.pagination.page + 1, usersData.pagination.limit, "")}
                  disabled={usersData.pagination.page === usersData.pagination.totalPages}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTrainers = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-6 m-4 text-center">
          <p>{error}</p>
          <button 
            onClick={() => fetchTrainers(trainersData.pagination.page, trainersData.pagination.limit, "")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Manage Trainers</h2>
            <input
              type="text"
              placeholder="Search trainers..."
              onChange={(e) => fetchTrainers(1, trainersData.pagination.limit, e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-gray-400">Name</th>
                  <th className="py-3 px-4 text-gray-400">Email</th>
                  <th className="py-3 px-4 text-gray-400">Expertise</th>
                  <th className="py-3 px-4 text-gray-400">Programs</th>
                  <th className="py-3 px-4 text-gray-400">Clients</th>
                  <th className="py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainersData.trainers && trainersData.trainers.length > 0 ? (
                  trainersData.trainers.map((trainer) => (
                    <tr key={trainer.id} className="border-b border-gray-800">
                      <td className="py-3 px-4 text-white">{trainer.name || "Unknown"}</td>
                      <td className="py-3 px-4 text-gray-400">{trainer.email || "No email"}</td>
                      <td className="py-3 px-4 text-gray-400">{trainer.expertise || "None"}</td>
                      <td className="py-3 px-4 text-gray-400">{trainer.programCount || 0}</td>
                      <td className="py-3 px-4 text-gray-400">{trainer.clientCount || 0}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteTrainer(trainer.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-400">
                      No trainers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {trainersData.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-400">
                Showing {trainersData.pagination.page} of {trainersData.pagination.totalPages} pages
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchTrainers(trainersData.pagination.page - 1, trainersData.pagination.limit, "")}
                  disabled={trainersData.pagination.page === 1}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchTrainers(trainersData.pagination.page + 1, trainersData.pagination.limit, "")}
                  disabled={trainersData.pagination.page === trainersData.pagination.totalPages}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMemberships = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-6 m-4 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchMemberships}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Add random features if none exist
    const membershipsWithRandomFeatures = membershipsData.memberships.map(membership => ({
      ...membership,
      features: membership.features && membership.features.length > 0 
        ? membership.features 
        : ["Fitness Classes", "Free Weights", "Personal Training", "Nutrition Plan", "Sauna Access"].slice(0, Math.floor(Math.random() * 5) + 1)
    }));

    return (
      <div className="space-y-6 p-6">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Manage Memberships</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membershipsWithRandomFeatures && membershipsWithRandomFeatures.length > 0 ? (
              membershipsWithRandomFeatures.map((membership) => (
                <div key={membership.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white">{membership.name}</h3>
                    <button
                      className="text-gray-400 hover:text-white"
                      // Placeholder for edit functionality
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-400 mb-2">Duration: {membership.duration} days</p>
                  <p className="text-gray-400 mb-4">Active Members: {membership.userCount || 0}</p>
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Features:</h4>
                    <ul className="list-disc list-inside text-gray-300">
                      {membership.features && membership.features.length > 0 ? (
                        membership.features.map((feature, index) => (
                          <li key={index} className="text-sm">{feature}</li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-400">No features listed</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center col-span-3 py-6">
                No memberships found
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfileTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6 p-6">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Admin Profile</h2>
          
          {adminProfile ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-red-500 text-2xl font-bold">
                  {adminProfile.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{adminProfile.username}</h3>
                  <p className="text-gray-400">{adminProfile.email || "No email provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Account Created</h4>
                  <p className="text-white">
                    {adminProfile.created_at ? new Date(adminProfile.created_at).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Last Login</h4>
                  <p className="text-white">
                    {adminProfile.last_login ? new Date(adminProfile.last_login).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-800">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center">Admin profile not available</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 bg-gray-900 shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">
            <span className="text-white">GYM</span>
            <span className="text-red-500">FIT</span>
            <span className="text-xs text-red-400 ml-1">ADMIN</span>
          </h1>
        </div>
        <nav className="py-6">
          <ul className="space-y-2">
            <NavItem 
              active={activeTab === "overview"} 
              icon={<TrendingUp size={20} />} 
              label="Overview" 
              onClick={() => setActiveTab("overview")} 
            />
            <NavItem 
              active={activeTab === "users"} 
              icon={<Users size={20} />} 
              label="Manage Users" 
              onClick={() => setActiveTab("users")} 
            />
            <NavItem 
              active={activeTab === "trainers"} 
              icon={<User size={20} />} 
              label="Manage Trainers" 
              onClick={() => setActiveTab("trainers")} 
            />
            <NavItem 
              active={activeTab === "memberships"} 
              icon={<CreditCard size={20} />} 
              label="Memberships" 
              onClick={() => setActiveTab("memberships")} 
            />
            <NavItem 
              active={activeTab === "profile"} 
              icon={<Settings size={20} />} 
              label="Admin Profile" 
              onClick={() => setActiveTab("profile")} 
            />
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-gray-900 shadow-md p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div className="flex items-center space-x-4">
            {adminProfile && (
              <span className="text-gray-300">
                Welcome, <span className="font-medium">{adminProfile.username}</span>
              </span>
            )}
          </div>
        </header>
        
        <main className="p-4">
          {renderTabContent()}
        </main>
      </div>
      
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
                {passwordSuccess}
              </div>
            )}
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-1 text-white">{value}</p>
        <p className="text-green-500 text-xs mt-2">{trend}</p>
      </div>
      <div className="p-3 bg-gray-800 rounded rever rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

const NavItem = ({ active, icon, label, onClick }) => (
  <li>
    <button 
      onClick={onClick}
      className={`flex items-center space-x-3 w-full px-6 py-3 transition-colors ${
        active 
          ? "bg-red-600/20 text-red-500 border-l-4 border-red-500" 
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  </li>
);

export default AdminDashboard;