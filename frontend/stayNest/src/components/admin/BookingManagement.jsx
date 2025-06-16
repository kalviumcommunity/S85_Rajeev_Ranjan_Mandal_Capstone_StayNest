import React, { useState, useEffect } from "react";
import axios from "axios";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/bookings?${params}`
      );
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status, adminNotes = "") => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/bookings/${bookingId}/status`,
        {
          status,
          adminNotes,
        }
      );
      fetchBookings(); // Refresh the list
      alert("Booking status updated successfully!");
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Error updating booking status");
    }
  };

  const processRefund = async (bookingId, amount, reason) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/bookings/${bookingId}/refund`,
        {
          refundAmount: parseFloat(amount),
          refundReason: reason,
        }
      );
      fetchBookings(); // Refresh the list
      alert("Refund processed successfully!");
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Error processing refund");
    }
  };

  const handleRefund = (booking) => {
    const amount = prompt(`Enter refund amount (max: ₹${booking.totalPrice}):`);
    if (
      amount &&
      parseFloat(amount) > 0 &&
      parseFloat(amount) <= booking.totalPrice
    ) {
      const reason = prompt("Enter refund reason:");
      if (reason) {
        processRefund(booking._id, amount, reason);
      }
    } else if (amount) {
      alert("Invalid refund amount");
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
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Booking Management
        </h3>
        <div className="flex space-x-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Details */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {booking.property?.title || "Property Not Found"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      📍 {booking.property?.location?.city}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status?.charAt(0).toUpperCase() +
                      booking.status?.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Guest</p>
                    <p className="font-medium">{booking.guest?.name}</p>
                    <p className="text-gray-600">{booking.guest?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Host</p>
                    <p className="font-medium">{booking.host?.name}</p>
                    <p className="text-gray-600">{booking.host?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-medium">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-medium">
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guests</p>
                    <p className="font-medium">
                      {booking.guests?.adults || 0} adults
                      {booking.guests?.children > 0 &&
                        `, ${booking.guests.children} children`}
                      {booking.guests?.infants > 0 &&
                        `, ${booking.guests.infants} infants`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-green-600">
                      ₹{booking.totalPrice}
                    </p>
                  </div>
                </div>

                {booking.adminNotes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Admin Notes:</strong> {booking.adminNotes}
                    </p>
                  </div>
                )}

                {booking.refund && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                    <p className="text-sm text-purple-800">
                      <strong>Refund:</strong> ${booking.refund.amount} -{" "}
                      {booking.refund.reason}
                    </p>
                    <p className="text-xs text-purple-600">
                      Processed on{" "}
                      {new Date(
                        booking.refund.processedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={booking.status}
                    onChange={(e) => {
                      const notes = prompt("Add admin notes (optional):");
                      updateBookingStatus(
                        booking._id,
                        e.target.value,
                        notes || ""
                      );
                    }}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {booking.status !== "refunded" &&
                  booking.status !== "cancelled" && (
                    <button
                      onClick={() => handleRefund(booking)}
                      className="w-full bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 transition-colors"
                    >
                      💰 Process Refund
                    </button>
                  )}

                <div className="text-xs text-gray-500">
                  <p>Booking ID: {booking._id}</p>
                  <p>
                    Created: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📅</div>
          <p>No bookings found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400 transition-colors"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default BookingManagement;
