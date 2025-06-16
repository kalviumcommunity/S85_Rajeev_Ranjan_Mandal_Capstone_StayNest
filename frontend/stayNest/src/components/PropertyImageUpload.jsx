import React, { useState, useRef, useEffect } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const PropertyImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  required = false,
}) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Initialize previews with existing images
    if (images.length > 0) {
      const initialPreviews = images.map((img) =>
        typeof img === "string" ? img : img.url || img
      );
      setPreviews(initialPreviews);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Check if adding these files would exceed max limit
    if (images.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await uploadFile(file, images.length + i);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Client-side image compression function
  const compressImage = (
    file,
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8
  ) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file, index) => {
    if (!isMountedRef.current) return;

    // Validate file type - now supports more formats
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Please select valid image files (JPEG, PNG, GIF, WebP, BMP)"
      );
      return;
    }

    // No strict file size limit - we'll compress automatically
    const maxSize = 20 * 1024 * 1024; // 20MB max for initial upload
    if (file.size > maxSize) {
      setUploadError("File is too large. Please select a file under 20MB.");
      return;
    }

    setUploadingIndex(index);
    setUploadError("");

    try {
      // Compress image before upload for better performance
      let fileToUpload = file;

      // Only compress if file is larger than 1MB or dimensions might be large
      if (file.size > 1024 * 1024) {
        try {
          const compressedFile = await compressImage(file);
          if (compressedFile && compressedFile.size < file.size) {
            fileToUpload = new File([compressedFile], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            console.log(
              `Compressed ${file.name} from ${(file.size / 1024 / 1024).toFixed(
                2
              )}MB to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`
            );
          }
        } catch (compressionError) {
          console.warn(
            "Client-side compression failed, uploading original:",
            compressionError
          );
          // Continue with original file if compression fails
        }
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isMountedRef.current) {
          setPreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews[index] = e.target.result;
            return newPreviews;
          });
        }
      };
      reader.readAsDataURL(fileToUpload);

      // Upload to server
      const formData = new FormData();
      formData.append("image", fileToUpload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/property-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      if (isMountedRef.current && result.success) {
        // Update images array
        const newImages = [...images];
        newImages[index] = {
          url: result.imageUrl,
          public_id: result.publicId,
        };
        onImagesChange(newImages);
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (isMountedRef.current) {
        setUploadError(error.message || "Upload failed");
        // Remove preview on error
        setPreviews((prev) => {
          const newPreviews = [...prev];
          newPreviews.splice(index, 1);
          return newPreviews;
        });
      }
    } finally {
      if (isMountedRef.current) {
        setUploadingIndex(null);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    onImagesChange(newImages);
    setPreviews(newPreviews);
    setUploadError("");
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Property Images {required && "*"}
        </label>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {uploadError}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={
                  previews[index] ||
                  (typeof image === "string" ? image : image.url)
                }
                alt={`Property image ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              {uploadingIndex === index && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX size={16} />
            </button>
          </div>
        ))}

        {/* Add New Image Button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="aspect-w-16 aspect-h-12 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            <FiUpload size={24} />
            <span className="text-sm mt-1">Add Image</span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Upload up to {maxImages} images of your property. All images are
        automatically optimized for best performance. Supported formats: JPEG,
        PNG, GIF, WebP, BMP. Max size: 20MB per image (will be automatically
        compressed).
      </p>
      <p className="text-xs text-blue-600 mt-1">
        ✨ Smart optimization: Images are automatically resized, compressed, and
        converted to the best format for fast loading while maintaining quality.
      </p>
    </div>
  );
};

export default PropertyImageUpload;
