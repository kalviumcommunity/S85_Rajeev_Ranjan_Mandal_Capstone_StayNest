import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BookingRequest = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get property and booking details from navigation state
  const { property, bookingDetails } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    checkIn: bookingDetails?.checkIn || "",
    checkOut: bookingDetails?.checkOut || "",
    adults: bookingDetails?.guests?.adults || 1,
    children: bookingDetails?.guests?.children || 0,
    infants: bookingDetails?.guests?.infants || 0,
    specialRequests: "",
    cancellationPolicy: "moderate",
    totalPrice: bookingDetails?.totalPrice || 0,
    priceBreakdown: {
      basePrice: 0,
      cleaningFee: 50,
      serviceFee: 0,
      taxes: 0,
      discounts: 0,
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!property || !bookingDetails) {
      navigate(`/properties/${propertyId}`);
      return;
    }

    // Calculate price breakdown
    const nights = bookingDetails.nights || 1;
    const basePrice = property.price * nights;
    const serviceFee = Math.round(basePrice * 0.14);
    const taxes = Math.round(basePrice * 0.12);
    const cleaningFee = 500;
    const totalPrice = basePrice + cleaningFee + serviceFee + taxes;

    setFormData((prev) => ({
      ...prev,
      totalPrice,
      priceBreakdown: {
        basePrice,
        cleaningFee,
        serviceFee,
        taxes,
        discounts: 0,
      },
    }));
  }, [user, property, bookingDetails, propertyId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        propertyId: property._id,
        hostId: property.host._id || property.host,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: {
          adults: formData.adults,
          children: formData.children,
          infants: formData.infants,
        },
        totalPrice: formData.totalPrice,
        priceBreakdown: formData.priceBreakdown,
        cancellationPolicy: formData.cancellationPolicy,
        specialRequests: formData.specialRequests,
        status: "confirmed", // Booking confirmed, payment on arrival
        payment: {
          status: "pending",
          amount: formData.totalPrice,
          paymentMethod: "pay_on_arrival",
          dueDate: formData.checkIn,
        },
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create booking");
      }

      // Navigate directly to success page (no payment needed)
      navigate("/booking-success", {
        state: {
          booking: result.booking,
          property,
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!property || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Booking Information Missing
          </h2>
          <p className="text-gray-600 mb-6">
            Please start your booking from the property page.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Properties
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
            to={`/properties/${propertyId}`}
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
            Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 mt-2">
            Review your booking details and confirm your reservation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form
              id="booking-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Property Summary */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Details
                </h3>
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      property.images?.[0]?.url ||
                      property.images?.[0] ||
                      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                    }
                    alt={property.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {property.title}
                    </h4>
                    <p className="text-gray-600">
                      {property.location?.address ||
                        property.location?.city ||
                        "Location"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {property.propertyType} • {property.maxGuests} guests •{" "}
                      {property.bedrooms} bedrooms
                    </p>
                  </div>
                </div>
              </div>

              {/* Host Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Host
                </h3>
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      property.host?.profilePicture ||
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                    }
                    alt={property.host?.name || "Host"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">
                        {property.host?.name || "Host"}
                      </h4>
                      {property.host?.isVerified && (
                        <svg
                          className="w-4 h-4 text-blue-500 ml-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Host since{" "}
                      {new Date(
                        property.host?.createdAt || Date.now()
                      ).getFullYear()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {property.host?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Booking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adults
                    </label>
                    <input
                      type="number"
                      name="adults"
                      value={formData.adults}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Children
                    </label>
                    <input
                      type="number"
                      name="children"
                      value={formData.children}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Infants
                    </label>
                    <input
                      type="number"
                      name="infants"
                      value={formData.infants}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Special Requests
                </h3>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests or requirements? (Optional)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cancellation Policy
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value="flexible"
                      checked={formData.cancellationPolicy === "flexible"}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Flexible</span>
                      <p className="text-sm text-gray-600">
                        Full refund 1 day prior to arrival
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value="moderate"
                      checked={formData.cancellationPolicy === "moderate"}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Moderate</span>
                      <p className="text-sm text-gray-600">
                        Full refund 5 days prior to arrival
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="cancellationPolicy"
                      value="strict"
                      checked={formData.cancellationPolicy === "strict"}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Strict</span>
                      <p className="text-sm text-gray-600">
                        50% refund up until 1 week prior to arrival
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>
                    ₹{property.price} x {bookingDetails.nights} nights
                  </span>
                  <span>₹{formData.priceBreakdown.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>₹{formData.priceBreakdown.cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₹{formData.priceBreakdown.serviceFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{formData.priceBreakdown.taxes}</span>
                </div>
                {formData.priceBreakdown.discounts > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discounts</span>
                    <span>-₹{formData.priceBreakdown.discounts}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{formData.totalPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                form="booking-form"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </button>

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
                  <p className="text-amber-800 text-sm font-medium">
                    Pay ₹{formData.totalPrice} on arrival - Booking confirmed
                    instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingRequest;
