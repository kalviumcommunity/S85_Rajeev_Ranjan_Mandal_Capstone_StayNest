import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropertyImageUpload from "./PropertyImageUpload";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    guests: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "apartment",
    amenities: [],
    images: [""],
    houseRules: [""],
    checkIn: "15:00",
    checkOut: "11:00",
  });

  const amenitiesList = [
    "WiFi",
    "Kitchen",
    "Washing machine",
    "Air conditioning",
    "Heating",
    "TV",
    "Hot tub",
    "Pool",
    "Gym",
    "Parking",
    "Balcony",
    "Garden",
    "Pet friendly",
    "Smoking allowed",
    "Events allowed",
    "Family friendly",
    "Wheelchair accessible",
    "Elevator",
    "Fireplace",
    "BBQ grill",
  ];

  useEffect(() => {
    if (!user || user.role !== "host") {
      navigate("/login");
      return;
    }
    fetchProperty();
  }, [id, user, navigate]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/properties/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const property = data.property;
        setFormData({
          title: property.title || "",
          description: property.description || "",
          location: property.location || "",
          price: property.price?.toString() || "",
          guests: property.guests?.toString() || "",
          bedrooms: property.bedrooms?.toString() || "",
          bathrooms: property.bathrooms?.toString() || "",
          propertyType: property.propertyType || "apartment",
          amenities: property.amenities || [],
          images: property.images?.length ? property.images : [""],
          houseRules: property.houseRules?.length ? property.houseRules : [""],
          checkIn: property.checkIn || "15:00",
          checkOut: property.checkOut || "11:00",
        });
      } else {
        setError("Property not found or access denied");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setError("Error loading property");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImagesChange = (images) => {
    setFormData((prev) => ({
      ...prev,
      images: images,
    }));
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...formData.houseRules];
    newRules[index] = value;
    setFormData((prev) => ({ ...prev, houseRules: newRules }));
  };

  const addRuleField = () => {
    setFormData((prev) => ({
      ...prev,
      houseRules: [...prev.houseRules, ""],
    }));
  };

  const removeRuleField = (index) => {
    if (formData.houseRules.length > 1) {
      const newRules = formData.houseRules.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, houseRules: newRules }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.price || formData.price <= 0)
      errors.price = "Valid price is required";
    if (!formData.guests || formData.guests <= 0)
      errors.guests = "Number of guests is required";
    if (!formData.bedrooms || formData.bedrooms <= 0)
      errors.bedrooms = "Number of bedrooms is required";
    if (!formData.bathrooms || formData.bathrooms <= 0)
      errors.bathrooms = "Number of bathrooms is required";

    const validImages = formData.images.filter((img) => img.trim());
    if (validImages.length === 0)
      errors.images = "At least one image is required";

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        guests: parseInt(formData.guests),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        images: formData.images.filter((img) => img.trim()),
        houseRules: formData.houseRules.filter((rule) => rule.trim()),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/properties/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(propertyData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess("Property updated successfully!");
        setTimeout(() => {
          navigate("/host/dashboard");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      setError("Error updating property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/host/dashboard")}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
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
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Beautiful apartment in downtown"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="New York, NY"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Describe your property..."
              />
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per night (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests *
                </label>
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="cottage">Cottage</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.amenities.includes(amenity)
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                        formData.amenities.includes(amenity)
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.amenities.includes(amenity) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Property Images */}
            <div>
              <PropertyImageUpload
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
                required={true}
              />
            </div>

            {/* House Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                House Rules
              </label>
              <div className="space-y-3">
                {formData.houseRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter a house rule..."
                    />
                    <button
                      type="button"
                      onClick={() => removeRuleField(index)}
                      className="px-4 py-3 text-red-600 hover:text-red-700 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRuleField}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add House Rule
                </button>
              </div>
            </div>

            {/* Check-in/Check-out Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/host/dashboard")}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Updating..." : "Update Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
