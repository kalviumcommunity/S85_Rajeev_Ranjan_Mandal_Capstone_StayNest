import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookingDetails();
  }, [bookingId, user, navigate]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Booking not found");
      }

      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The booking you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/bookings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/bookings"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Bookings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking Details
              </h1>
              <p className="text-gray-600 mt-2">
                Booking ID: {booking._id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Information
              </h3>
              <div className="flex items-start space-x-4">
                <img
                  src={
                    booking.property?.images?.[0]?.url ||
                    booking.property?.images?.[0] ||
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                  }
                  alt={booking.property?.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {booking.property?.title}
                  </h4>
                  <p className="text-gray-600">
                    {booking.property?.location?.address ||
                      booking.property?.location?.city ||
                      "Location"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.property?.propertyType} • {booking.property?.maxGuests} guests •{" "}
                    {booking.property?.bedrooms} bedrooms
                  </p>
                </div>
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Host Information
              </h3>
              <div className="flex items-center space-x-4">
                <img
                  src={
                    booking.host?.profilePicture ||
                    "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  }
                  alt={booking.host?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {booking.host?.name}
                  </h4>
                  <p className="text-sm text-gray-600">{booking.host?.email}</p>
                  {booking.host?.phone && (
                    <p className="text-sm text-gray-600">
                      Phone: {booking.host.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guests
                  </label>
                  <p className="text-gray-900">
                    {booking.guests?.adults} adults
                    {booking.guests?.children > 0 && `, ${booking.guests.children} children`}
                    {booking.guests?.infants > 0 && `, ${booking.guests.infants} infants`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nights
                  </label>
                  <p className="text-gray-900">
                    {Math.ceil(
                      (new Date(booking.checkOut) - new Date(booking.checkIn)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    nights
                  </p>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <p className="text-gray-900">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base price</span>
                  <span>₹{booking.priceBreakdown?.basePrice || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>₹{booking.priceBreakdown?.cleaningFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₹{booking.priceBreakdown?.serviceFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{booking.priceBreakdown?.taxes || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{booking.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.payment?.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.payment?.status || "Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>Pay on Arrival</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Due</span>
                  <span className="font-semibold">₹{booking.totalPrice}</span>
                </div>
              </div>

              {booking.payment?.status === "pending" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-amber-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-amber-800 text-sm">
                      Payment due on arrival
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
