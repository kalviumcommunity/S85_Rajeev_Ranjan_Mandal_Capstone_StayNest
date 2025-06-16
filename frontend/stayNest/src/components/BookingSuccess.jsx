import React from "react";
import { useLocation, Link } from "react-router-dom";

const BookingSuccess = () => {
  const location = useLocation();
  const { booking, property } = location.state || {};

  if (!booking || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to find your booking information.
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Your reservation has been successfully confirmed. You'll receive a
            confirmation email shortly.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-amber-600 mr-2"
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
              <p className="text-amber-800 font-medium">
                Payment Required: ₹{booking.totalPrice} to be paid on arrival
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Property</p>
                <p className="font-medium">{property.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-medium">{booking._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="font-medium">
                  {new Date(booking.checkIn).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-medium">
                  {new Date(booking.checkOut).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="font-medium">
                  {booking.guests.adults} adults
                  {booking.guests.children > 0 &&
                    `, ${booking.guests.children} children`}
                  {booking.guests.infants > 0 &&
                    `, ${booking.guests.infants} infants`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-blue-600">
                  ₹{booking.totalPrice}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking Status</p>
                <p className="font-medium text-green-600">Confirmed</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium text-amber-600">Pay on Arrival</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancellation Policy</p>
                <p className="font-medium capitalize">
                  {booking.cancellationPolicy}
                </p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-4 text-left">
                <p className="text-sm text-gray-600">Special Requests</p>
                <p className="font-medium">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You'll receive a confirmation email with all details</li>
              <li>• The host will be notified of your booking</li>
              <li>
                •{" "}
                <strong>
                  Bring ₹{booking.totalPrice} cash/card for payment on arrival
                </strong>
              </li>
              <li>• You can view and manage this booking in "My Bookings"</li>
              <li>• Contact the host directly for any special arrangements</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/bookings"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse More Properties
            </Link>
            <Link
              to={`/properties/${property._id}`}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
