import React, { useState } from 'react';

const Review = () => {
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle review submission logic here
    console.log('Rating:', rating);
    console.log('Comment:', comment);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Leave a Review</h2>
      <label>
        Rating:
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </label>
      <label>
        Comment:
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </label>
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default Review;