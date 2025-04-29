import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AppAuth";

// Protected route component
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return isLoggedIn ? children : <Navigate to="/login" />;
}

// Membership Required route - redirects to membership selection if no membership
function MembershipRequired({ children }) {
  const { isLoggedIn, loading, membershipTier } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return membershipTier ? children : <Navigate to="/membership-selection" />;
}

export { ProtectedRoute, MembershipRequired };