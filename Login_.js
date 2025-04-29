import { useNavigate } from "react-router-dom";

export default function Login_() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <div className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-6">Trainer Authentication</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => navigate("/trainer-login")} 
            className="btn-primary w-full py-2">
            Login
          </button>
          <button 
            onClick={() => navigate("/trainer-register")} 
            className="btn-secondary w-full py-2">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
