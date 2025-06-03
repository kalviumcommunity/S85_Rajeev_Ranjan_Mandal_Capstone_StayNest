import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in React StrictMode
    if (hasProcessed.current) {
      console.log("OAuth already processed, skipping...");
      return;
    }

    console.log("OAuthSuccess component mounted");
    console.log("Current URL:", window.location.href);

    const token = searchParams.get("token");
    console.log("Token from URL:", token ? "Found" : "Missing");

    if (token) {
      hasProcessed.current = true;
      const processOAuth = async () => {
        try {
          console.log("Processing OAuth success...");

          // Store token in localStorage
          localStorage.setItem("token", token);
          console.log("Token stored in localStorage");

          // Set axios default header
          const axios = (await import("axios")).default;
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("Axios header set");

          // Fetch user data using the token
          console.log("Fetching user data...");
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/current`
          );

          if (response.data.success) {
            const userData = response.data.user;
            console.log("User data fetched:", userData);

            // Set user in context
            setUser(userData);
            console.log("User set in context");

            // Show success message
            const successMessage = `Welcome ${userData.name}! You've successfully logged in with Google.`;
            console.log("Success message:", successMessage);

            // Redirect to home page after a short delay
            console.log("Setting timeout for redirect...");
            setTimeout(() => {
              console.log("Redirecting to home page...");
              navigate("/", {
                state: {
                  message: successMessage,
                  type: "success",
                },
              });
            }, 1500);
          } else {
            throw new Error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error processing OAuth success:", error);
          navigate("/login?error=oauth_processing_failed");
        }
      };

      processOAuth();
    } else {
      console.log("Missing token parameter");
      navigate("/login?error=oauth_missing_token");
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
          {/* Loading Spinner */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg mb-6">
            <svg
              className="w-8 h-8 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Successful!
          </h2>
          <p className="text-gray-600 mb-4">Processing your login...</p>

          {/* Success Animation */}
          <div className="flex justify-center">
            <div className="animate-pulse">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
