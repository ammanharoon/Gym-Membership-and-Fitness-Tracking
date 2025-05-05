import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// AdminRoute is a protected route component that only allows authenticated admins
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if the admin is authenticated
    const adminAuthenticated = localStorage.getItem("adminAuthenticated");
    console.log("AdminRoute protection check:", adminAuthenticated);
    
    setIsAdmin(adminAuthenticated === "true");
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return isAdmin ? children : <Navigate to="/admin-login" />;
};

export default AdminRoute;