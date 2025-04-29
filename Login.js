import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      // Store token or user data in localStorage if needed
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Login failed"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-xl shadow-lg p-8 border border-[#2f3a4f]">
        <h2 className="text-3xl font-semibold text-white mb-6 text-center">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#2d3748] border border-[#4b5563] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#2d3748] border border-[#4b5563] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-lg font-medium hover:from-purple-800 hover:to-indigo-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-[#1e293b]"
          >
            Login
          </button>
        </form>
        
        <p className="mt-5 text-center text-gray-300">
          Don't have an account? <Link to="/register" className="text-purple-400 hover:text-purple-300 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;