import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropertyImageUpload from "./PropertyImageUpload";
import { Formik, Form, Field } from 'formik';
import { propertyValidationSchema } from '../validations/propertyValidation';
import { toast } from 'react-toastify';

const AddProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const propertyTypes = [
    "apartment",
    "house",
    "villa",
    "cottage",
    "other"
  ];

  const availableAmenities = [
    "WiFi",
    "Kitchen",
    "Air Conditioning",
    "Heating",
    "Parking",
    "Pool",
    "Hot Tub",
    "Gym",
    "Laundry",
    "Balcony",
    "Terrace",
    "Garden",
    "Fireplace",
    "TV",
    "Workspace",
    "Beach Access",
    "Mountain View",
    "Ocean View",
    "City View",
    "Pet Friendly",
    "Smoking Allowed",
    "Wheelchair Accessible",
    "Family Friendly",
    "Business Friendly",
  ];

  const initialValues = {
    title: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: ""
    },
    price: "",
    propertyType: "",
    maxGuests: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
    images: [],
    rules: [],
    cancellationPolicy: "moderate",
    availability: true
  };

  const scrollToError = (errors) => {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.property && result.message === "Property created successfully") {
        toast.success("Property added successfully!");
        navigate("/host/dashboard");
      } else {
        const errorMessage = result.message || "Failed to add property";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Error adding property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Property</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={propertyValidationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={false}
      >
        {({ errors, touched, isSubmitting, setFieldValue, values, validateForm, handleSubmit: formikHandleSubmit }) => (
          <Form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            const errors = await validateForm();
            if (Object.keys(errors).length > 0) {
              scrollToError(errors);
              toast.error('Please fix the validation errors');
              return;
            }
            formikHandleSubmit(e);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title *
                </label>
                <Field
                  name="title"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title && touched.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Luxury Downtown Apartment"
                />
                {errors.title && touched.title && (
                  <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Describe your property..."
                />
                {errors.description && touched.description && (
                  <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Field
                    name="location.address"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.location?.address && touched.location?.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Street address"
                  />
                  {errors.location?.address && touched.location?.address && (
                    <div className="text-red-500 text-sm mt-1">{errors.location.address}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Field
                    name="location.city"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.location?.city && touched.location?.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="City"
                  />
                  {errors.location?.city && touched.location?.city && (
                    <div className="text-red-500 text-sm mt-1">{errors.location.city}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Field
                    name="location.state"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.location?.state && touched.location?.state ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="State"
                  />
                  {errors.location?.state && touched.location?.state && (
                    <div className="text-red-500 text-sm mt-1">{errors.location.state}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <Field
                    name="location.country"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.location?.country && touched.location?.country ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Country"
                  />
                  {errors.location?.country && touched.location?.country && (
                    <div className="text-red-500 text-sm mt-1">{errors.location.country}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <Field
                    as="select"
                    name="propertyType"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.propertyType && touched.propertyType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </Field>
                  {errors.propertyType && touched.propertyType && (
                    <div className="text-red-500 text-sm mt-1">{errors.propertyType}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night (₹) *
                  </label>
                  <Field
                    name="price"
                    type="number"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.price && touched.price ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="150"
                  />
                  {errors.price && touched.price && (
                    <div className="text-red-500 text-sm mt-1">{errors.price}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Guests *
                  </label>
                  <Field
                    name="maxGuests"
                    type="number"
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.maxGuests && touched.maxGuests ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="4"
                  />
                  {errors.maxGuests && touched.maxGuests && (
                    <div className="text-red-500 text-sm mt-1">{errors.maxGuests}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms *
                  </label>
                  <Field
                    name="bedrooms"
                    type="number"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.bedrooms && touched.bedrooms ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="2"
                  />
                  {errors.bedrooms && touched.bedrooms && (
                    <div className="text-red-500 text-sm mt-1">{errors.bedrooms}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms *
                  </label>
                  <Field
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.bathrooms && touched.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="2"
                  />
                  {errors.bathrooms && touched.bathrooms && (
                    <div className="text-red-500 text-sm mt-1">{errors.bathrooms}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                        ${values.amenities.includes(amenity)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <Field
                        type="checkbox"
                        name="amenities"
                        value={amenity}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center
                          ${values.amenities.includes(amenity)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'}`}
                      >
                        {values.amenities.includes(amenity) && (
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
                {errors.amenities && touched.amenities && (
                  <div className="text-red-500 text-sm mt-2">{errors.amenities}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Images *
                </label>
                <PropertyImageUpload
                  images={values.images}
                  onImagesChange={(images) => setFieldValue('images', images)}
                  maxImages={10}
                  required={true}
                />
                {errors.images && touched.images && (
                  <div className="text-red-500 text-sm mt-2">{errors.images}</div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Adding Property...' : 'Add Property'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddProperty;
