import React, { useState } from "react";
import axios from "axios";

const ReviewForm = ({ postId, setReviews }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a valid rating between 1 and 5.");
      setIsSubmitting(false);
      return;
    }
  
    if (!comment.trim()) {
      setError("Please enter a comment.");
      setIsSubmitting(false);
      return;
    }
  
    try {
      const user = JSON.parse(localStorage.getItem('user'));
  
      if (!user || !user.token) {
        setError("User not authenticated. Please log in.");
        setIsSubmitting(false);
        return;
      }
  
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/posts/${postId}/reviews`,
        { rating, comment },
        { 
          headers: { 
            Authorization: `Bearer ${user.token}`
          },
          withCredentials: true 
        }
      );
  
      console.log("RESPONSE", response);
  
      // Assuming `response.data` contains the updated list of reviews
      setReviews(response.data.reviews || []); 
      setRating(0);
      setComment("");
    } catch (error) {
      console.log("Error", error);
  
      if (error.response) {
        console.error("Server Response:", error.response.data); // Log the full server response
        setError(`Error ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error("Request Error:", error.request); // Log the request details if no response was received
        setError("Error: No response received from the server.");
      } else {
        setError("Error: An unexpected error occurred.");
      }
    }
    setIsSubmitting(false);
  };
  

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>
      {error && <p className="error">{error}</p>}
      <div>
        <label htmlFor="rating">Rating:</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          required
        >
          <option value="0">Select Rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
      </div>
      <div>
        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
