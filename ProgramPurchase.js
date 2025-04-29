import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AppAuth';

const ProgramPurchase = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { token, purchaseProgram } = useAuth();
  
  // Fetch available programs when component mounts
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/programs", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Cache-Control": "no-cache"
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch programs");
        }
        
        const data = await response.json();
        // Filter only programs that are available (not purchased)
        const availablePrograms = data.filter(program => program.client_id === null);
        setPrograms(availablePrograms);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setError("Could not load programs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrograms();
  }, [token]);
  
  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    // Store for persistence across page refreshes if needed
    localStorage.setItem("programId", program.id);
  };
  
  const confirmPurchase = async () => {
    if (!selectedProgram) {
      alert("Please select a program first.");
      return;
    }
    
    try {
      setPaymentMessage("Processing payment...");
      
      // Use the purchaseProgram function from our auth context
      const result = await purchaseProgram(selectedProgram.id);
      
      console.log("✅ Purchase successful:", result);
      
      // Reset state and show success message
      setSelectedProgram(null);
      setPaymentMessage("✅ Payment Confirmed!");
      
      // Refresh programs list to remove the purchased one
      const updatedPrograms = programs.filter(p => p.id !== selectedProgram.id);
      setPrograms(updatedPrograms);
      
      // Clear message after a delay
      setTimeout(() => setPaymentMessage(""), 3000);
      
    } catch (error) {
      console.error("❌ Purchase failed:", error);
      
      // Handle specific error cases
      if (error.message.includes("Authentication")) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        setPaymentMessage(`❌ Error: ${error.message || "Purchase failed"}`);
        setTimeout(() => setPaymentMessage(""), 5000);
      }
    }
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Loading programs...</h2>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="p-8 rounded-lg bg-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-2 bg-white text-indigo-700 rounded-lg font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <div className="p-8 bg-white/10 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Available Training Programs</h2>
          <button 
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
        
        {paymentMessage && (
          <div className={`mb-6 p-4 rounded-lg text-center ${paymentMessage.includes("✅") ? "bg-green-500/30" : "bg-yellow-500/30"}`}>
            {paymentMessage}
          </div>
        )}
        
        {programs.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-xl">No available programs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div 
                key={program.id}
                className={`p-6 rounded-lg cursor-pointer transition-all ${
                  selectedProgram?.id === program.id 
                    ? "bg-indigo-600 shadow-lg" 
                    : "bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => handleProgramSelect(program)}
              >
                <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                <p className="mb-4">{program.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">${program.price}</span>
                  <span className="text-sm">by {program.trainer_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedProgram && (
          <div className="mt-8 flex flex-col items-center">
            <h3 className="text-xl mb-4">Selected: {selectedProgram.name}</h3>
            <button
              onClick={confirmPurchase}
              className="px-8 py-3 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-all"
            >
              Purchase Program
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramPurchase;