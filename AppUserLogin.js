import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AppAuth";

function AppUserLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login, updateMembership } = useAuth();
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      console.log("Attempting login with:", form);
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(form),
      });
      
      console.log("Response status:", response.status);

      if (response.ok) {
        console.log("Login successful");
        const data = await response.json();
        
        if (data.token) {
          // Login with the received token
          login(data.token);
          
          // Check if user has membership
          try {
            const membershipResponse = await fetch("http://localhost:5000/api/membership/status", {
              headers: { "Authorization": `Bearer ${data.token}` }
            });
            
            console.log("Membership status response:", membershipResponse.status);
            
            if (membershipResponse.ok) {
              const membershipData = await membershipResponse.json();
              console.log("Membership data:", membershipData);
              
              // Check if membership data has valid tier or ID
              if (membershipData.membershipTier || membershipData.membershipId) {
                console.log("User has existing membership:", membershipData.membershipTier);
                // Update the membership state in context before navigating
                updateMembership(membershipData.membershipTier);
                navigate("/dashboard");
              } else {
                console.log("User has no membership, redirecting to selection");
                navigate("/membership-selection");
              }
            } else {
              console.error("Failed to check membership status, status code:", membershipResponse.status);
              navigate("/membership-selection");
            }
          } catch (membershipError) {
            console.error("Error checking membership:", membershipError);
            navigate("/membership-selection");
          }
        } else {
          // No token received, redirect to login
          console.error("No token received");
          setError("Authentication failed - no token received");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to the server. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <div className="text-center bg-[#1e293b] p-8 rounded-xl shadow-lg w-96 border border-[#2f3a4f]">
        <h2 className="text-3xl font-semibold mb-6">Welcome Back</h2>
        {error && <div className="mb-4 p-2 bg-red-600/70 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            className="w-full px-4 py-3 bg-[#2d3748] border border-[#4b5563] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 bg-[#2d3748] border border-[#4b5563] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
            onChange={handleChange} 
            required 
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-lg font-medium hover:from-purple-800 hover:to-indigo-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-[#1e293b]"
          >
            Log In
          </button>
        </form>
        <div className="mt-4">
          <Link to="/register" className="text-purple-400 hover:text-purple-300 hover:underline">Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default AppUserLogin;