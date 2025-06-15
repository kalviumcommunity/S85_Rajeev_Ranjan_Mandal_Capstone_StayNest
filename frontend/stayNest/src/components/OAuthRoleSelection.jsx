import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthRoleSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState("guest");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const userName = searchParams.get("name");
    
    if (!token) {
      navigate("/login?error=oauth_missing_token");
      return;
    }

    // Store token temporarily
    localStorage.setItem("temp_oauth_token", token);
    setUserInfo({ name: userName || "User" });
  }, [searchParams, navigate]);

  const handleRoleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("temp_oauth_token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Update user role
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/update-role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: selectedRole }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      // Store the final token
      localStorage.setItem("token", token);
      localStorage.removeItem("temp_oauth_token");

      // Set axios default header
      const axios = (await import("axios")).default;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set user in context
      setUser(data.user);

      // Show success message and redirect
      const successMessage = `Welcome ${data.user.name}! Your account has been set up as a ${selectedRole}.`;
      
      setTimeout(() => {
        navigate("/", {
          state: {
            message: successMessage,
            type: "success",
          },
        });
      }, 1500);

    } catch (error) {
      console.error("Error updating role:", error);
      // Clean up and redirect to login
      localStorage.removeItem("temp_oauth_token");
      navigate("/login?error=role_selection_failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">StayNest</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {userInfo.name}!
              </h2>
              <p className="text-gray-600">
                Choose your account type to complete setup
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Account Type
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <input
                      id="guest-role"
                      name="role"
                      type="radio"
                      value="guest"
                      checked={selectedRole === "guest"}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="guest-role"
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedRole === "guest"
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <div>
                          <span className="text-sm font-medium block">
                            Book Stays
                          </span>
                          <span className="text-xs text-gray-500">
                            Find and book amazing places to stay
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="host-role"
                      name="role"
                      type="radio"
                      value="host"
                      checked={selectedRole === "host"}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="host-role"
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedRole === "host"
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <div>
                          <span className="text-sm font-medium block">
                            Host My Place
                          </span>
                          <span className="text-xs text-gray-500">
                            List your property and earn money
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleRoleSubmit}
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <svg
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthRoleSelection;
