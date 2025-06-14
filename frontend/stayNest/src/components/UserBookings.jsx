import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filterBookings = (bookings) => {
    const now = new Date();

    switch (filter) {
      case "upcoming":
        return bookings.filter(
          (booking) =>
            new Date(booking.checkIn) > now && booking.status !== "cancelled"
        );
      case "past":
        return bookings.filter(
          (booking) =>
            new Date(booking.checkOut) < now || booking.status === "completed"
        );
      case "cancelled":
        return bookings.filter((booking) => booking.status === "cancelled");
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(bookings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Bookings
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage your reservations and travel plans
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "All Bookings" },
                { key: "upcoming", label: "Upcoming" },
                { key: "past", label: "Past" },
                { key: "cancelled", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "all"
                ? "You haven't made any bookings yet."
                : `No ${filter} bookings found.`}
            </p>
            <div className="mt-6">
              <Link
                to="/properties"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={
                          booking.property?.images?.[0]?.url ||
                          booking.property?.images?.[0] ||
                          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                        }
                        alt={booking.property?.title || "Property"}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.property?.title || "Property Not Found"}
                        </h3>
                        <p className="text-gray-600">
                          {booking.property?.location?.address ||
                            booking.property?.location?.city ||
                            "Location"}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {new Date(booking.checkIn).toLocaleDateString()} -{" "}
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </span>
                          <span>
                            {booking.guests.adults} adults
                            {booking.guests.children > 0 &&
                              `, ${booking.guests.children} children`}
                            {booking.guests.infants > 0 &&
                              `, ${booking.guests.infants} infants`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pay on Arrival
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        ${booking.totalPrice}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Booking ID: {booking._id}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/booking/${booking._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                      {booking.status === "confirmed" &&
                        new Date(booking.checkIn) > new Date() && (
                          <button className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                            Cancel Booking
                          </button>
                        )}
                      {booking.property && (
                        <Link
                          to={`/properties/${booking.property._id}`}
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-sm font-medium rounded-md text-white hover:bg-blue-700"
                        >
                          View Property
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings;
