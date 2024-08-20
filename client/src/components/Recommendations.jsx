import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';
// import './Recommendations.css'; // Import the CSS file

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/recommendations/${currentUser.id}`);
        setRecommendations(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching recommendations");
      }
    };

    if (currentUser) {
      fetchRecommendations();
    }
  }, [currentUser]);

  return (
    <div className="recommendations-container">
      <h2>Recommended Posts</h2>
      {error && <p className="error">{error}</p>}
      {recommendations.length > 0 ? (
        recommendations.map(post => (
          <div key={post._id} className="post">
            {post.thumbnail && <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${post.thumbnail}`} alt={post.title} className="post-thumbnail" />}
            <h3 className="post-title">{post.title}</h3>
            <p className="post-description">{post.description}</p>
          </div>
        ))
      ) : (
        <p className="no-recommendations">No recommendations available.
        First You Have To Login !!!</p>
      )}
    </div>
  );
};

export default Recommendations;
