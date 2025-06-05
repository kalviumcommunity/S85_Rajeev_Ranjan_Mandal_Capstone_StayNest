import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Review = () => {
  const { id: propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);

  // Error state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch reviews for the property
  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/property/${propertyId}`
      );
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
      } else {
        setError("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Error loading reviews");
    } finally {
      setLoading(false);
    }
  };

  // Create or Update review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to leave a review");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const reviewData = {
        propertyId,
        rating: parseInt(rating),
        comment: comment.trim(),
      };

      const url = editingReview
        ? `${import.meta.env.VITE_API_URL}/reviews/${editingReview._id}`
        : `${import.meta.env.VITE_API_URL}/reviews`;

      const method = editingReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          editingReview
            ? "Review updated successfully!"
            : "Review submitted successfully!"
        );
        setRating(5);
        setComment("");
        setEditingReview(null);
        fetchReviews(); // Refresh reviews list
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Review deleted successfully!");
        fetchReviews(); // Refresh reviews list
      } else {
        setError(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setError("Error deleting review");
    }
  };

  // Start editing a review
  const handleEdit = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setError("");
    setSuccess("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(5);
    setComment("");
    setError("");
    setSuccess("");
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-xl ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
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
            Back to Property
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Property Reviews</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Review Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingReview ? "Edit Review" : "Leave a Review"}
            </h2>

            {user ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-colors ${
                          star <= rating ? "text-yellow-400" : "text-gray-300"
                        } hover:text-yellow-400`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating} star{rating !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Share your experience..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : editingReview
                      ? "Update Review"
                      : "Submit Review"}
                  </button>

                  {editingReview && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Please login to leave a review
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-primary-600 text-white py-2 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              All Reviews ({reviews.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border-b border-gray-200 pb-6 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            review.user?.profilePicture ||
                            "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                          }
                          alt={review.user?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.user?.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit/Delete buttons for user's own reviews */}
                      {user && user._id === review.user?._id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(review)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
