import React from "react";
import { Link } from "react-router-dom";

function AppHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <div className="text-center p-8 rounded-lg bg-white/10 backdrop-blur-sm shadow-xl">
        <h1 className="text-5xl font-bold mb-6">Welcome to Gym System</h1>
        <p className="text-xl mb-8 opacity-90">Your fitness journey starts here</p>
        <nav className="space-x-6">
          <Link to="/login" className="px-6 py-3 bg-white text-indigo-700 rounded-lg font-medium transition-all hover:bg-indigo-100 hover:shadow-lg">
            Login
          </Link>
          <Link to="/register" className="px-6 py-3 bg-transparent border-2 border-white rounded-lg font-medium transition-all hover:bg-white/20 hover:shadow-lg">
            Sign Up
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default AppHome;