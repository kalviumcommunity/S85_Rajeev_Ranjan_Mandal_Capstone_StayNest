import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // Fetch user properties from API
    const fetchProperties = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/properties/my-properties`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          const userProperties = result.properties;
          setProperties(userProperties);

          // Calculate stats
          const totalProperties = userProperties.length;
          const totalBookings = userProperties.reduce(
            (sum, prop) => sum + (prop.reviews || 0),
            0
          );
          const totalRevenue = userProperties.reduce(
            (sum, prop) => sum + prop.price * (prop.reviews || 0),
            0
          );
          const averageRating =
            userProperties.length > 0
              ? userProperties.reduce(
                  (sum, prop) => sum + (prop.rating || 0),
                  0
                ) / userProperties.length
              : 0;

          setStats({
            totalProperties,
            totalBookings,
            totalRevenue,
            averageRating: averageRating.toFixed(1),
          });
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Fallback to empty state
        setProperties([]);
        setStats({
          totalProperties: 0,
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
        });
      }
    };

    fetchProperties();
  }, []);

  const deleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/properties/${propertyId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          const updatedProperties = properties.filter(
            (prop) => prop.id !== propertyId
          );
          setProperties(updatedProperties);
          alert("Property deleted successfully!");
        } else {
          throw new Error(result.message || "Failed to delete property");
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Error deleting property. Please try again.");
      }
    }
  };

  const toggleFeatured = async (propertyId) => {
    try {
      const property = properties.find((prop) => prop.id === propertyId);
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ featured: !property.featured }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedProperties = properties.map((prop) =>
          prop.id === propertyId ? { ...prop, featured: !prop.featured } : prop
        );
        setProperties(updatedProperties);
      } else {
        throw new Error(result.message || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Error updating property. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Host Dashboard
              </h1>
              <p className="mt-3 text-lg text-white/90">
                Manage your properties and track your performance
              </p>
            </div>
            <Link
              to="/host/add-property"
              className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-semibold hover:bg-white/30 transform hover:scale-105 transition-all duration-300 shadow-xl animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div
            className="card-modern p-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg animate-glow">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-500">
                  Total Properties
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalProperties}
                </p>
              </div>
            </div>
          </div>

          <div
            className="card-modern p-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg animate-glow">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-500">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalBookings}
                </p>
              </div>
            </div>
          </div>

          <div
            className="card-modern p-8 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg animate-glow">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-500">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className="card-modern p-8 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg animate-glow">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-semibold text-gray-500">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.averageRating}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div
          className="card-modern animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="px-8 py-6 border-b border-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Properties
            </h2>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No properties yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first property.
              </p>
              <div className="mt-6">
                <Link
                  to="/host/add-property"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-glow"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Your First Property
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {properties.map((property) => (
                <div key={property._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          (property.images &&
                            property.images[0] &&
                            property.images[0].url) ||
                          "https://via.placeholder.com/100x80"
                        }
                        alt={property.title}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {typeof property.location === "string"
                            ? property.location
                            : `${property.location.city}, ${property.location.state}`}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">
                            ₹{property.price}/night
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {property.maxGuests} guests
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {property.bedrooms} bed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {property.featured && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}

                      <button
                        onClick={() => toggleFeatured(property._id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          property.featured
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {property.featured ? "Unfeature" : "Feature"}
                      </button>

                      <Link
                        to={`/properties/${property._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                      >
                        View
                      </Link>

                      <Link
                        to={`/host/edit-property/${property._id}`}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteProperty(property._id)}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
