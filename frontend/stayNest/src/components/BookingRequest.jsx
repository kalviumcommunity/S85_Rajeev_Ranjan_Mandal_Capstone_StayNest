import React, { useState } from 'react';

const BookingRequest = () => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle booking logic here
    console.log('Check-in:', checkIn);
    console.log('Check-out:', checkOut);
    console.log('Number of guests:', guests);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Booking Request</h2>
      <label>
        Check-in:
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </label>
      <label>
        Check-out:
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </label>
      <label>
        Number of Guests:
        <input
          type="number"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          min="1"
          required
        />
      </label>
      <button type="submit">Submit Booking</button>
    </form>
  );
};

export default BookingRequest;