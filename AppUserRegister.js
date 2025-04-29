import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AppAuth";

function AppUserRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          // Save token and login
          login(data.token);
          // Navigate to membership selection
          navigate("/membership-selection");
        } else {
          alert("Registration successful but no token received");
          navigate("/login");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a2634] text-white">
      <div className="text-center bg-white/5 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-96 border border-white/10">
        <h2 className="text-2xl font-semibold mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            name="name" 
            placeholder="Full Name" 
            className="w-full px-4 py-3 bg-gray-100/90 rounded-xl text-black focus:outline-none placeholder-gray-500" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            className="w-full px-4 py-3 bg-gray-100/90 rounded-xl text-black focus:outline-none placeholder-gray-500" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 bg-gray-100/90 rounded-xl text-black focus:outline-none placeholder-gray-500" 
            onChange={handleChange} 
            required 
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl transition-all"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4">
          <Link to="/user-login" className="text-gray-300 hover:text-white transition-all">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default AppUserRegister;