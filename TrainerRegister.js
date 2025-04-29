import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrainerRegister() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" , expertise: "", password: ""});

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure all fields are filled
    if (!form.name || !form.email || !form.password || !form.expertise) {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/registertrainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        navigate("/Login"); // Redirect to login page after successful registration
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Trainer registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Failed to connect to the server. Is the backend running?");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1624] text-white">
      <div className="w-full max-w-md p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-purple-300">Trainer Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              name="name" 
              value={form.name}
              placeholder="Full Name" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300" 
              onChange={handleChange} 
            />
          </div>
          <div>
            <input 
              type="email" 
              name="email" 
              value={form.email}
              placeholder="Email Address" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300" 
              onChange={handleChange} 
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password" 
              value={form.password}
              placeholder="Password" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300" 
              onChange={handleChange} 
            />
          </div>
          <div>
            <input 
              type="text" 
              name="expertise" 
              value={form.expertise}
              placeholder="Expertise (e.g., Strength Training, Yoga)" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300" 
              onChange={handleChange} 
            />
          </div>
          <div>
            <input 
              type="text" 
              name="phone" 
              value={form.phone}
              placeholder="Phone Number" 
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300" 
              onChange={handleChange} 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white font-medium p-3 rounded-lg mt-6 transition-all hover:bg-purple-700"
            >
            Register
          </button>
        </form>
      </div>
    </div>
);
}
