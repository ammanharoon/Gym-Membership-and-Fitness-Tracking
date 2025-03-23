import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App"; // Import the auth context

const MembershipSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const { token, updateMembership } = useAuth();

  const membershipPlans = [
    { id: "basic", name: "Basic Plan", price: "$10/month", features: ["Gym Access", "Locker"] },
    { id: "standard", name: "Standard Plan", price: "$25/month", features: ["Gym Access", "Locker", "Group Classes"] },
    { id: "premium", name: "Premium Plan", price: "$50/month", features: ["All Standard Features", "Personal Trainer", "Sauna Access"] },
  ];

  const handleConfirm = async () => {
    if (!selectedPlan) {
      alert("Please select a membership plan.");
      return;
    }

    if (!token) {
      alert("You need to be logged in to select a membership plan");
      navigate("/login");
      return;
    }

    try {
      console.log("Submitting membership selection");
      
      const response = await fetch("http://localhost:5000/api/membership/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ membershipTier: selectedPlan }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update membership in context
        updateMembership(selectedPlan);
        alert("Membership successfully selected!");
        navigate("/dashboard"); // Redirect after success
      } else {
        console.error("Server response:", data);
        alert(data.message || "Failed to select membership.");
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <div className="p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center">Select Your Membership</h2>
        {membershipPlans.map((plan) => (
          <div
            key={plan.id}
            className={`p-4 mb-4 rounded-lg cursor-pointer border transition-all ${
              selectedPlan === plan.id ? "bg-indigo-600 text-white border-white shadow-lg" : "border-white/50 hover:bg-white/20"
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-lg">{plan.price}</p>
            <ul className="text-sm opacity-80 mt-2">
              {plan.features.map((feature, index) => (
                <li key={index}>✔ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
        <button
          onClick={handleConfirm}
          className="w-full bg-white text-indigo-700 font-medium p-3 rounded-lg mt-4 transition-all hover:bg-indigo-100"
        >
          Confirm Membership
        </button>
      </div>
    </div>
  );
};

export default MembershipSelection;