import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, isAuthenticated, becomeHost } = useAuth();
  const navigate = useNavigate();
  const [isBecomingHost, setIsBecomingHost] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleBecomeHost = async () => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to register
      navigate("/register");
      return;
    }

    if (user?.role === "host") {
      // If already a host, redirect to host dashboard
      navigate("/host/dashboard");
      return;
    }

    if (user?.role === "guest") {
      // If guest, upgrade to host
      setIsBecomingHost(true);
      try {
        const result = await becomeHost();
        if (result.success) {
          // Show success toast
          setSuccessMessage(
            result.message ||
              "Welcome to hosting! You can now add your first property."
          );
          setShowSuccessToast(true);

          // Hide toast and redirect after delay
          setTimeout(() => {
            setShowSuccessToast(false);
            navigate("/host/dashboard");
          }, 3000);
        } else {
          alert(result.error || "Failed to become a host. Please try again.");
        }
      } catch (error) {
        console.error("Error becoming host:", error);
        alert("Failed to become a host. Please try again.");
      } finally {
        setIsBecomingHost(false);
      }
    }
  };

  const features = [
    {
      name: "Wide Selection",
      description:
        "Choose from thousands of unique homes, apartments, and more.",
      icon: (
        <svg
          className="h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      name: "Best Price Guarantee",
      description: "We offer the best prices for your perfect stay.",
      icon: (
        <svg
          className="h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: "Easy Booking",
      description: "Simple and secure booking process.",
      icon: (
        <svg
          className="h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{successMessage}</span>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {/* Announcement Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm md:text-base font-medium">
            🎉 <strong>New!</strong> Book verified properties with instant
            confirmation -
            <span className="underline ml-1 cursor-pointer hover:text-green-100">
              Get 20% off your first booking
            </span>
          </p>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="relative z-10 text-center lg:text-left">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
                  ✨ Welcome to StayNest
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Find your perfect
                <span className="block bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  homestay experience
                </span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl leading-relaxed">
                Discover handpicked properties from verified hosts worldwide.
                From cozy apartments to luxury villas - find your perfect home
                away from home with instant booking and 24/7 support.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 lg:justify-start justify-center">
                <Link
                  to="/properties"
                  className="group inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Explore Stays</span>
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
                </Link>
                <button
                  onClick={handleBecomeHost}
                  disabled={isBecomingHost}
                  className="group inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg text-primary-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isBecomingHost ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-700"
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
                      <span>
                        {user?.role === "guest"
                          ? "Becoming Host..."
                          : "Loading..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {!isAuthenticated
                          ? "Become a Host"
                          : user?.role === "host"
                          ? "Host Dashboard"
                          : user?.role === "guest"
                          ? "Become a Host"
                          : "Become a Host"}
                      </span>
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
                          d={
                            user?.role === "host"
                              ? "M9 5l7 7-7 7"
                              : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                          }
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    10K+
                  </div>
                  <div className="text-xs text-blue-200">Happy Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    500+
                  </div>
                  <div className="text-xs text-blue-200">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    50+
                  </div>
                  <div className="text-xs text-blue-200">Cities</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative lg:block">
              <div className="relative">
                <img
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl shadow-2xl"
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Beautiful homestay"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Floating Cards */}
                <div className="absolute -bottom-3 -left-3 bg-white rounded-lg p-3 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">
                        Verified Host
                      </div>
                      <div className="text-xs text-gray-500">100% Trusted</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3 bg-white rounded-lg p-3 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">
                        4.9 Rating
                      </div>
                      <div className="text-xs text-gray-500">2,847 reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold mb-4">
              ⭐ Why Choose StayNest
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              A better way to find your
              <span className="block bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                perfect stay
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
              Experience seamless booking, verified properties, and exceptional
              hospitality that makes every stay memorable and worry-free.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.name}
                  className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {React.cloneElement(feature.icon, {
                        className: "h-6 w-6",
                      })}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {feature.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Arrow Icon */}
                    <div className="mt-4 flex items-center text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-medium">Learn more</span>
                      <svg
                        className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform"
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Properties
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Stays
            </p>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Discover our most popular destinations
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Property Card 1 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Beachfront Villa
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            $200
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            /night
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      to="/properties/1"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Property Card 2 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Mountain Cabin
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            $150
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            /night
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      to="/properties/2"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Property Card 3 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          City Apartment
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            $120
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            /night
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link
                      to="/properties/3"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/properties"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View all properties
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start your journey?</span>
            <span className="block">
              {isAuthenticated
                ? "Explore amazing places to stay."
                : "Start booking your next adventure today."}
            </span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            {isAuthenticated
              ? "Discover your next perfect getaway from our curated collection of properties."
              : "Join thousands of travelers who have found their perfect stay with us."}
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
            >
              Sign up for free
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/properties"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
            >
              Explore Properties
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
