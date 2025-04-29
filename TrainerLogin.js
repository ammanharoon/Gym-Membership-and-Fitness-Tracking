import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TrainerLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/logintrainer", form);
      
      if (response.status === 200) {
        const { token, trainerId } = response.data;
  
        if (trainerId) {
          localStorage.setItem("trainerToken", token);
          localStorage.setItem("trainerId", trainerId); // ✅ Store trainer ID
          console.log("✅ Trainer ID stored:", trainerId);
          navigate("/trainer-dashboard");
        } else {
          alert("Trainer ID is missing in response.");
        }
      } else {
        alert(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ Trainer login failed:", error);
      alert("Error connecting to server.");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1624] text-white">
      <div className="w-full max-w-md p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#a855f7]">Trainer Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <input 
              type="email" 
              name="email" 
              value={form.email}
              placeholder="Email Address" 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password" 
              value={form.password}
              placeholder="Password" 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white font-medium p-3 rounded-lg mt-6 transition-all hover:bg-purple-700"
          >
            Log In
          </button>
        </form>
        
        <div className="mt-8 flex justify-center">
          <div className="bg-[#1b2639] p-4 rounded-lg w-96 text-center">
            <h3 className="text-lg mb-2">New to the platform?</h3>
            <button 
              onClick={() => navigate("/trainer-register")} 
              className="text-purple-400 hover:text-purple-300"
            >
              Create a trainer account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}