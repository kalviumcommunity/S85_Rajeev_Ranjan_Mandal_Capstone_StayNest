import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add a response interceptor to handle 401 Unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, clear the authentication state
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      // You might want to redirect to login here or handle it in the component
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults and fetch user on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/me`);
      if (data.success) {
        setUser(data.user);
        // Update the token in localStorage if a new one was returned
        if (data.token) {
          localStorage.setItem("token", data.token);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.token}`;
        }
      } else {
        throw new Error(data.message || "Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Don't clear auth state here to prevent redirect loops
      // The interceptor will handle 401 responses
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await axios.post(`${API_URL}/users/register`, userData);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setUser(data.user);
        return { success: true };
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const { data } = await axios.post(`${API_URL}/users/login`, credentials);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setUser(data.user);
        return { success: true };
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/users/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear the auth state, even if the API call fails
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      // Note: Navigation should be handled by the component calling logout
    }
  };

  // Check if user has required role(s)
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  // Set user directly (for OAuth success)
  const setUserData = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        hasRole,
        register,
        login,
        logout,
        fetchUser, // Expose fetchUser to allow manual refresh of user data
        setUser: setUserData, // Expose setUser for OAuth success
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
