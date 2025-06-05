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
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    // Create preview with cleanup
    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = (e) => {
      if (isMountedRef.current) {
        setPreviewImage(e.target.result);
      }
    };

    reader.onerror = () => {
      if (isMountedRef.current) {
        setUploadError("Failed to read file");
      }
    };

    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    if (!isMountedRef.current) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // Create AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/profile-picture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
          signal: abortController.signal, // Add abort signal
        }
      );

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      const data = await response.json();

      if (response.ok && data.success && data.imageUrl) {
        if (isMountedRef.current) {
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
        }
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      // Don't update state if component is unmounted or request was aborted
      if (!isMountedRef.current || error.name === "AbortError") return;

      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload image");
      setPreviewImage(currentImage); // Reset to original image
    } finally {
      if (isMountedRef.current) {
        setIsUploading(false);
      }
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
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? "Uploading..." : "Choose Image"}
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
