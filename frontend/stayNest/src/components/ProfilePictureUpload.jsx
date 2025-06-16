import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePictureUpload = ({
  currentImage,
  onImageUpdate,
  disabled = false,
}) => {
  const { user, setUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewImage, setPreviewImage] = useState(currentImage);
  const fileInputRef = useRef(null);
  const fileReaderRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Cleanup FileReader
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }

      // Cleanup fetch request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileSelect = async (event) => {
    console.log("File select triggered"); // DEBUG
    const file = event.target.files[0];
    console.log("Selected file:", file); // DEBUG

    if (!file) {
      console.log("No file selected"); // DEBUG
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type); // DEBUG
      setUploadError("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size); // DEBUG
      setUploadError("File size must be less than 5MB");
      return;
    }

    console.log("File validation passed, creating preview..."); // DEBUG

    // Create preview with cleanup
    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = (e) => {
      if (isMountedRef.current) {
        setPreviewImage(e.target.result);
        console.log("Preview image set"); // DEBUG
      }
    };

    reader.onerror = () => {
      if (isMountedRef.current) {
        setUploadError("Failed to read file");
      }
    };

    reader.readAsDataURL(file);

    // Upload file
    console.log("Starting upload..."); // DEBUG
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    console.log("uploadFile called with:", file.name); // DEBUG

    setIsUploading(true);
    setUploadError("");

    try {
      // Create AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const formData = new FormData();
      formData.append("image", file);

      const apiUrl = `${import.meta.env.VITE_API_URL}/users/profile-picture`;
      const token = localStorage.getItem("token");

      console.log("API URL:", apiUrl); // DEBUG
      console.log("Token exists:", !!token); // DEBUG
      console.log("Making POST request..."); // DEBUG

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: abortController.signal, // Add abort signal
      });

      console.log("Response received:", response.status, response.statusText); // DEBUG

      const data = await response.json();
      console.log("Response data:", data); // DEBUG

      if (response.ok && data.success && data.imageUrl) {
        setPreviewImage(data.imageUrl);
        onImageUpdate(data.imageUrl);

        // Immediately update user context so avatar updates everywhere
        if (user) {
          setUser({
            ...user,
            profilePicture: data.imageUrl,
          });
        }

        setUploadError("");
        console.log("Upload successful!"); // DEBUG
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      // Don't update state if request was aborted
      if (error.name === "AbortError") return;

      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload image");
      setPreviewImage(currentImage); // Reset to original image
    } finally {
      setIsUploading(false);
      // Clear the abort controller reference
      abortControllerRef.current = null;
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    if (!isMountedRef.current) return;

    setPreviewImage("");
    onImageUpdate("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Profile Picture
      </label>

      {/* Image Preview */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={
              previewImage ||
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
            }
            alt="Profile preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={disabled || isUploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Uploading...
                </div>
              ) : (
                "📸 Choose Image"
              )}
            </button>

            {previewImage && previewImage !== currentImage && (
              <button
                type="button"
                onClick={removeImage}
                disabled={disabled || isUploading}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Upload a new profile picture. Max size: 5MB. Formats: JPEG, PNG,
            GIF.
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Error message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {uploadError}
        </div>
      )}

      {/* Success message */}
      {previewImage &&
        previewImage !== currentImage &&
        !uploadError &&
        !isUploading && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            ✅ Image uploaded successfully! Don't forget to save your profile.
          </div>
        )}
    </div>
  );
};

export default ProfilePictureUpload;
