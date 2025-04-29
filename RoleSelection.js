import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full text-white font-['Montserrat'] flex flex-col overflow-hidden bg-black">
      {/* Header */}
      <header className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-black to-gray-900 shadow-lg">
        <div className="text-5xl font-extrabold tracking-wider animate-pulse">
          <span className="text-white">GYM</span><span className="text-red-600 bg-clip-text bg-gradient-to-r from-red-600 to-red-400">FIT</span>
        </div>
      </header>

      {/* Main Content */}
      <div 
        className="relative flex items-center flex-1 w-full bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(120deg, 
              rgba(0, 0, 0, 0.8), 
              rgba(190, 0, 0, 0.5), 
              rgba(0, 0, 0, 0.8)
            ), 
            url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')
          `
        }}
      >
        {/* Abstract floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-red-600/10 blur-3xl"></div>
          <div className="absolute bottom-24 -left-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-red-500/10 blur-2xl"></div>
        </div>
        
        <div className="ml-16 max-w-lg z-10 relative">
          <h1 className="text-6xl font-extrabold tracking-tight uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-white drop-shadow-lg">
            Power Up Your Gains with GYMFIT!
          </h1>
          <p className="text-lg font-medium text-gray-300 mb-6 text-shadow drop-shadow-md">
            Smash your PRs, forge an iron physique, and conquer the gym with unstoppable energy!
          </p>
          <div className="flex space-x-6">
            <button 
              onClick={() => navigate("/user-login")} 
              className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-semibold uppercase rounded-lg transition-all shadow-lg hover:shadow-red-500/40 transform hover:-translate-y-1"
            >
              Enter as Member
            </button>
            <button 
              onClick={() => navigate("/trainer-login")} 
              className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-semibold uppercase rounded-lg transition-all shadow-lg hover:shadow-white/30 transform hover:-translate-y-1"
            >
              Enter as Trainer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}