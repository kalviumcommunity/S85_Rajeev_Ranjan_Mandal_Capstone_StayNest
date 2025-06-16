import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  // Booking form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    calculatePrice();
  }, [checkIn, checkOut, property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      console.log("Fetching property with ID:", id);
      console.log("API URL:", import.meta.env.VITE_API_URL);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/properties/${id}`
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Property not found");
      }

      const data = await response.json();
      console.log("Property data received:", data);
      setProperty(data);
    } catch (error) {
      console.error("Error fetching property:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!checkIn || !checkOut || !property) return;

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff > 0) {
      setNights(daysDiff);
      const basePrice = property.price * daysDiff;
      const cleaningFee = 500; // Fixed cleaning fee
      const serviceFee = Math.round(basePrice * 0.14); // 14% service fee
      const taxes = Math.round(basePrice * 0.12); // 12% taxes

      setTotalPrice(basePrice + cleaningFee + serviceFee + taxes);
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out date must be after check-in date");
      return;
    }

    // Navigate to booking page with property and booking details
    navigate(`/book/${id}`, {
      state: {
        property,
        bookingDetails: {
          checkIn,
          checkOut,
          guests: { adults, children, infants },
          totalPrice,
          nights,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Property Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error === "Property not found"
              ? "The property you're looking for doesn't exist."
              : "There was an error loading the property details."}
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/properties"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Images */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden">
              <img
                src={
                  property.images && property.images.length > 0
                    ? typeof property.images[currentImageIndex] === "string"
                      ? property.images[currentImageIndex]
                      : property.images[currentImageIndex]?.url
                    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                }
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images && property.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? property.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === property.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 gap-4">
              {property.images &&
                property.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-44 lg:h-60 rounded-xl overflow-hidden cursor-pointer ${
                      index === currentImageIndex ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={typeof image === "string" ? image : image?.url}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {property.location?.address ||
                      property.location?.city ||
                      "Location not specified"}
                    {property.location?.city &&
                      property.location?.state &&
                      `, ${property.location.city}, ${property.location.state}`}
                  </p>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-lg font-medium text-gray-900">
                    {typeof property.rating === "object"
                      ? property.rating?.average || "4.5"
                      : property.rating || "4.5"}
                  </span>
                  <span className="ml-1 text-gray-500">
                    (
                    {typeof property.reviewCount === "object"
                      ? property.reviewCount?.count || "0"
                      : property.reviewCount || "0"}{" "}
                    reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <span>
                  {property.maxGuests || property.guests || "2"} guests
                </span>
                <span>{property.bedrooms || "1"} bedrooms</span>
                <span>{property.bathrooms || "1"} bathrooms</span>
                <span>
                  {property.propertyType || property.type || "Property"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {property.featured && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
                {property.instantBook && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Instant Book
                  </span>
                )}
                {property.status === "approved" && (
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full">
                    No amenities listed
                  </p>
                )}
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Meet Your Host
              </h3>
              <div className="flex items-start space-x-4">
                <img
                  src={
                    property.host?.profilePicture ||
                    "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  }
                  alt={property.host?.name || "Host"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {property.host?.name || "Host"}
                    </h4>
                    {property.host?.isVerified && (
                      <svg
                        className="w-5 h-5 text-blue-500 ml-2"
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
                  <div className="text-sm text-gray-600 mb-3">
                    <p>
                      Host since{" "}
                      {new Date(
                        property.host?.createdAt || Date.now()
                      ).getFullYear()}
                    </p>
                    <p>{property.host?.email}</p>
                    {property.host?.phone && (
                      <p>Phone: {property.host.phone}</p>
                    )}
                  </div>
                  {property.host?.bio && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {property.host.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <span>
                      ⭐{" "}
                      {typeof property.host?.rating === "object"
                        ? property.host?.rating?.average || "4.8"
                        : property.host?.rating || "4.8"}{" "}
                      Host rating
                    </span>
                    <span>
                      🏠 {property.host?.propertyCount || "1"} properties
                    </span>
                    <span>
                      📝{" "}
                      {typeof property.host?.reviewCount === "object"
                        ? property.host?.reviewCount?.count || "0"
                        : property.host?.reviewCount || "0"}{" "}
                      reviews
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                House Rules
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20">
                    Check-in:
                  </span>
                  <span className="text-gray-600">
                    {property.checkIn || "3:00 PM"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20">
                    Check-out:
                  </span>
                  <span className="text-gray-600">
                    {property.checkOut || "11:00 AM"}
                  </span>
                </div>
              </div>
              {property.houseRules && property.houseRules.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {property.houseRules.map((rule, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg
                        className="w-4 h-4 text-gray-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {rule}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-gray-500">
                  No specific house rules listed
                </p>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">
                  ₹{property.price}
                  <span className="text-lg font-normal text-gray-600">
                    {" "}
                    / night
                  </span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4 mb-6">
                {/* Check-in and Check-out */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </label>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Adults</span>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{adults}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAdults(
                              Math.min(property.maxGuests || 10, adults + 1)
                            )
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Children</span>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(children + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Infants</span>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setInfants(Math.max(0, infants - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{infants}</span>
                        <button
                          type="button"
                          onClick={() => setInfants(infants + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="border-t pt-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        ₹{property.price} x {nights} nights
                      </span>
                      <span>₹{property.price * nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>₹500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>₹{Math.round(property.price * nights * 0.14)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>₹{Math.round(property.price * nights * 0.12)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg mb-4"
              >
                {user ? "Proceed to Checkout" : "Login to Book"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Pay on arrival - No upfront payment required
              </div>

              {/* Host Info */}
              <div className="flex items-center mt-6 p-4 bg-gray-50 rounded-lg">
                <img
                  src={
                    property.host?.profilePicture ||
                    "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                  }
                  alt={property.host?.name || "Host"}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {property.host?.name || "Host"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Host since{" "}
                    {new Date(
                      property.host?.createdAt || Date.now()
                    ).getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
