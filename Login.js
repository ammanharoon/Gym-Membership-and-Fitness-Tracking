import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { authStyles } from "../styles/authStyles";

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
    <div style={authStyles.container}>
      <div style={authStyles.formContainer}>
        <h2 style={authStyles.title}>Welcome Back</h2>
        <form onSubmit={handleSubmit} style={authStyles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={authStyles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={authStyles.input}
          />
          <button type="submit" style={authStyles.button}>Login</button>
        </form>
        <p style={{ marginTop: '20px' }}>
          Don't have an account? <Link to="/register" style={authStyles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;