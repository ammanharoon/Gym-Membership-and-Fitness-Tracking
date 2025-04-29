import React, { useState, useEffect } from "react";
import { useAuth } from "./AppAuth";

const ChangePlanModal = ({ onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { token, updateMembership, membershipTier } = useAuth();
  const [error, setError] = useState("");

  // Set the current plan as the initially selected plan
  useEffect(() => {
    if (membershipTier) {
      setSelectedPlan(membershipTier);
    }
  }, [membershipTier]);

  const membershipPlans = [
    { 
      id: "basic", 
      name: "Basic Plan", 
      price: "$10/month", 
      priceValue: 10.00,
      features: ["Gym Access", "Locker"] 
    },
    { 
      id: "standard", 
      name: "Standard Plan", 
      price: "$25/month", 
      priceValue: 25.00,
      features: ["Gym Access", "Locker", "Group Classes"] 
    },
    { 
      id: "premium", 
      name: "Premium Plan", 
      price: "$50/month", 
      priceValue: 50.00,
      features: ["All Standard Features", "Personal Trainer", "Sauna Access"] 
    },
  ];

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      setError("Please select a membership plan.");
      return;
    }

    if (selectedPlan === membershipTier) {
      setError("This is already your current plan. Please select a different plan to change to.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/membership/change-plan", {
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
        
        if (onSuccess) {
          onSuccess(selectedPlan);
        }
      } else {
        console.error("Server response:", data);
        setError(data.message || "Failed to change membership plan.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Change Membership Plan</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">
            Select a new membership plan below. Your account will be updated immediately.
            {membershipTier && (
              <span className="block mt-1 font-medium">
                Current plan: {membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)} Plan
              </span>
            )}
          </p>
          
          <div className="space-y-3">
            {membershipPlans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${
                  selectedPlan === plan.id 
                    ? "bg-indigo-100 border-indigo-500" 
                    : plan.id === membershipTier 
                      ? "bg-gray-100 border-gray-300" 
                      : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500">{plan.price}</p>
                  </div>
                  <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                    {selectedPlan === plan.id && (
                      <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {plan.id === membershipTier && selectedPlan !== plan.id && (
                      <span className="text-xs font-medium text-gray-500">Current</span>
                    )}
                  </div>
                </div>
                
                <ul className="mt-2 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-center">
                      <svg className="h-3 w-3 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleChangePlan}
            disabled={isProcessing || !selectedPlan || selectedPlan === membershipTier}
            className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isProcessing ? "Processing..." : "Confirm Change"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePlanModal;