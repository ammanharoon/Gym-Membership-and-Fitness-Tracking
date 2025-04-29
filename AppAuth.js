import React, { useState, useEffect, createContext, useContext } from "react";

// Create auth context for better state management
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membershipTier, setMembershipTier] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || sessionStorage.getItem("token"));
  

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!storedToken) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setToken(storedToken);

        // Verify with backend using token
        const response = await fetch("http://localhost:5000/api/membership/status", { 
          headers: { 
            "Authorization": `Bearer ${storedToken}`,
            "Cache-Control": "no-cache" 
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setMembershipTier(data.membershipTier);
          
          // Ensure token is in localStorage for persistence
          localStorage.setItem("token", storedToken);
          
          // Also check if we can get user info
          try {
            const userResponse = await fetch("http://localhost:5000/api/user", {
              headers: { "Authorization": `Bearer ${storedToken}` }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
              localStorage.setItem("userId", userData.id);
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        } else {
          // Invalid token
          setIsLoggedIn(false);
          clearTokens();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearTokens = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
  };

  const login = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setMembershipTier(null);
    clearTokens();
  };

  const updateMembership = (tier) => {
    setMembershipTier(tier);
  };

  // Function to handle program purchases
  const purchaseProgram = async (programId) => {
    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch("http://localhost:5000/api/buy-program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ programId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to purchase program");
      }

      const data = await response.json();
      
      // If the backend returns a userId, store it
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }
      
      return data;
    } catch (error) {
      console.error("Program purchase error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      login, 
      logout, 
      user, 
      loading, 
      token,
      membershipTier,
      updateMembership,
      purchaseProgram // Add new function to context
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };