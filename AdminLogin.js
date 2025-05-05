import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [credentials, setCredentials] = useState({ username: "", password: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuthenticated = localStorage.getItem("adminAuthenticated");
    // if (adminAuthenticated === "true") {
    //   navigate("/admin-dashboard");
    // }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isLogin 
        ? "http://localhost:5000/api/admin/login" 
        : "http://localhost:5000/api/admin/signup";
      
      console.log(`Attempting admin ${isLogin ? 'login' : 'signup'} with username:`, credentials.username);
      
      const response = await axios.post(url, credentials);
      
      if (response.status === 200 || response.status === 201) {
        console.log("Response data:", response.data);
        
        if (isLogin) {
          // Store admin authentication state and ID
          localStorage.setItem("adminAuthenticated", "true");
          localStorage.setItem("adminId", response.data.adminId);
          console.log("Admin login successful");
          navigate("/admin-dashboard");
        } else {
          // Show success message and switch to login
          alert("Admin account created successfully! Please login.");
          setIsLogin(true);
          setCredentials({ username: "", password: "", email: "" });
        }
      }
    } catch (error) {
      console.error(`Admin ${isLogin ? 'login' : 'signup'} failed:`, error);
      setError(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-red-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-black bg-opacity-50 rounded-xl shadow-2xl backdrop-blur-sm border border-red-500/20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white">
            GYM<span className="text-red-500">FIT</span>
            <span className="text-xs text-red-400 ml-1">ADMIN</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">{isLogin ? "Admin Login" : "Create Admin Account"}</p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-white bg-red-600/50 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required={!isLogin}
                  value={credentials.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                  placeholder="admin@example.com"
                />
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-lg font-medium text-white rounded-lg bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setCredentials({ username: "", password: "", email: "" });
            }} 
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate("/")} 
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Return to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;