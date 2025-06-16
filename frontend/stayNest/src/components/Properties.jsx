import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    priceRange: "",
    propertyType: "",
    amenities: [],
    rating: "",
    sortBy: "featured",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch properties from API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching properties from:",
        `${import.meta.env.VITE_API_URL}/properties`
      );
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/properties`
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      console.log("Properties fetched:", data.length, "properties");
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Set empty array if API fails
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...properties];

    // Location filter - search in city, state, or address
    if (currentFilters.location) {
      filtered = filtered.filter((property) => {
        const searchTerm = currentFilters.location.toLowerCase();
        return (
          property.location?.city?.toLowerCase().includes(searchTerm) ||
          property.location?.state?.toLowerCase().includes(searchTerm) ||
          property.location?.address?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Price range filter
    if (currentFilters.priceRange) {
      const [min, max] = currentFilters.priceRange.split("-").map(Number);
      filtered = filtered.filter(
        (property) =>
          property.price >= min && (max ? property.price <= max : true)
      );
    }

    // Property type filter
    if (currentFilters.propertyType) {
      filtered = filtered.filter(
        (property) =>
          property.propertyType === currentFilters.propertyType.toLowerCase()
      );
    }

    // Rating filter
    if (currentFilters.rating) {
      filtered = filtered.filter(
        (property) =>
          (property.rating?.average || 0) >= parseFloat(currentFilters.rating)
      );
    }

    // Sort
    switch (currentFilters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort(
          (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0)
        );
        break;
      case "featured":
      default:
        // Sort by creation date (newest first) since we don't have featured field
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProperties(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Find Your Perfect Stay
              </h1>
              <p className="mt-3 text-lg text-white/90">
                {filteredProperties.length} properties available
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden mt-6 inline-flex items-center px-6 py-3 glass border border-white/30 rounded-2xl text-sm font-semibold text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div
              className="card-modern p-8 sticky top-6 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Filters</h3>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) =>
                    handleFilterChange("priceRange", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Price</option>
                  <option value="0-100">$0 - $100</option>
                  <option value="100-200">$100 - $200</option>
                  <option value="200-300">$200 - $300</option>
                  <option value="300">$300+</option>
                </select>
              </div>

              {/* Property Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    handleFilterChange("propertyType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Loft">Loft</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    location: "",
                    priceRange: "",
                    propertyType: "",
                    amenities: [],
                    rating: "",
                    sortBy: "featured",
                  });
                  setFilteredProperties(properties);
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {filteredProperties.length === 0 ? (
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
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {properties.length === 0
                    ? "No properties available yet"
                    : "No properties found"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {properties.length === 0
                    ? "Be the first to list your property! Register as a host to get started."
                    : "Try adjusting your filters to see more results."}
                </p>
                {properties.length === 0 && (
                  <div className="mt-6">
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Become a Host
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="card-modern overflow-hidden group animate-fade-in-up">
      {/* Image Carousel */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={
            property.images && property.images.length > 0
              ? typeof property.images[currentImageIndex] === "string"
                ? property.images[currentImageIndex]
                : property.images[currentImageIndex]?.url
              : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          }
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Image Navigation */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image Indicators */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {property.images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {property.isApproved && (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              Verified
            </span>
          )}
          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full capitalize">
            {property.propertyType}
          </span>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <svg
            className={`w-4 h-4 ${
              isLiked ? "text-red-500 fill-current" : "text-gray-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Property Details */}
      <Link
        to={`/properties/${property._id}`}
        className="block p-4"
        onClick={() => console.log("Navigating to property:", property._id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {property.title}
            </h3>
            <p className="text-sm text-gray-600">
              {property.location?.city}, {property.location?.state}
            </p>
          </div>
          <div className="flex items-center ml-2">
            <svg
              className="w-4 h-4 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-900">
              {property.rating?.average?.toFixed(1) || "New"}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              ({property.rating?.count || 0})
            </span>
          </div>
        </div>

        {/* Property Info */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <span>{property.maxGuests} guests</span>
          <span className="mx-1">•</span>
          <span>{property.bedrooms} bedrooms</span>
          <span className="mx-1">•</span>
          <span>{property.bathrooms} bathrooms</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {property.amenities && property.amenities.length > 0 ? (
            <>
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-500">No amenities listed</span>
          )}
        </div>

        {/* Host Info */}
        <div className="flex items-center mb-3">
          <img
            src={
              property.host?.profilePicture ||
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
            }
            alt={property.host?.name || "Host"}
            className="w-6 h-6 rounded-full"
          />
          <span className="ml-2 text-sm text-gray-600">
            Hosted by {property.host?.name || "Host"}
          </span>
          {property.host?.role === "admin" && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Verified Host
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ₹{property.price}
            </span>
            <span className="text-sm text-gray-600"> / night</span>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-glow">
            View Details
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Properties;
