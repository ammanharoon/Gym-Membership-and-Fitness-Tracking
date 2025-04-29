import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import TrainerDashboard from "./components/trainer_dashboard";
import TrainerLogin from "./components/TrainerLogin";
import TrainerRegister from "./components/TrainerRegister";
import LLogin from "./components/Login_";
import RoleSelection from "./components/RoleSelection";
import MembershipSelection from "./components/MembershipSelection";
import ProgramPurchase from "./components/ProgramPurchase";
import { AuthProvider } from "./components/AppAuth";
import { ProtectedRoute, MembershipRequired } from "./components/AppRoutes";
import AppHome from "./components/AppHome";
import AppUserRegister from "./components/AppUserRegister";
import AppUserLogin from "./components/AppUserLogin";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/Login" element={<LLogin />} />
          <Route path="/register" element={<AppUserRegister />} />
          <Route path="/user-login" element={<AppUserLogin />} />
          
          <Route 
            path="/dashboard" 
            element={
              <MembershipRequired>
                <Dashboard />
              </MembershipRequired>
            } 
          />
          <Route 
            path="/membership-selection" 
            element={
              <ProtectedRoute>
                <MembershipSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/programs" 
            element={
              <MembershipRequired>
                <ProgramPurchase />
              </MembershipRequired>
            } 
          />
          <Route path="/trainer-login" element={<TrainerLogin />} />
          <Route path="/trainer-register" element={<TrainerRegister />} />
          <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;