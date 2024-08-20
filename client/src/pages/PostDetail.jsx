// import React, { useEffect, useContext, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import axios from "axios";
// import PostAuthor from "../components/PostAuthor";
// import Loader from "../components/Loader";
// import DeletePost from "./DeletePost";
// import ReviewForm from "../components/ReviewForm";
// import { UserContext } from "../context/userContext";

// const PostDetail = () => {
//   const { id } = useParams();
//   const [post, setPost] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const { currentUser } = useContext(UserContext);

//   useEffect(() => {
//     const getPost = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}`);
//         setPost(response.data);
//       } catch (error) {
//         setError(error);
//       }
//       setIsLoading(false);
//     };

//     const getReviews = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}/reviews`);
//         setReviews(response.data);
//       } catch (error) {
//         console.error("Error fetching reviews:", error);
//       }
//     };

//     getPost();
//     getReviews();
//   }, [id]);

//   if (isLoading) {
//     return <Loader />;
//   }

//   return (
//     <section className="post-detail">
//       {error && <p className="error">{error.message}</p>}
//       {post && (
//         <div className="container post-detail__container">
//           <div className="post-detail__header">
//             <PostAuthor authorID={post.creator} createdAt={post.createdAt} />
//             {currentUser?.id === post?.creator && (
//               <div className="post-detail__buttons">
//                 <Link to={`/posts/${post?._id}/edit`} className="btn sm primary">
//                   Edit
//                 </Link>
//                 <DeletePost postId={id} />
//                 <p>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
//               </div>
//             )}
//           </div>

//           <h1>{post.title}</h1>
//           <div className="post-detail__thumbnail">
//             <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${post.thumbnail}`} alt={post.title} />
//           </div>
//           <p dangerouslySetInnerHTML={{ __html: post.description }}></p>

//           {/* Review Section */}
//           <div className="reviews">
//             <h2>Reviews</h2>
//             {reviews.length > 0 ? (
//               reviews.map((review) => (
//                 <div key={review._id} className="review">
//                   <strong>By: {review.user?.name || 'Unknown User'}</strong>
//                   <p>Comment: {review.comment}</p>
//                   <p>Rating: {Array(review.rating).fill('⭐').join('')}</p> {/* Star rating */}
//                 </div>
//               ))
//             ) : (
//               <p>No reviews yet.</p>
//             )}
//           </div>

//           {/* Review Form */}
//           {currentUser && currentUser.id !== post.creator && <ReviewForm postId={id} setReviews={setReviews} />}
//         </div>
//       )}
//     </section>
//   );
// };

// export default PostDetail;


import React, { useEffect, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import PostAuthor from "../components/PostAuthor";
import Loader from "../components/Loader";
import DeletePost from "./DeletePost";
import ReviewForm from "../components/ReviewForm";
import { UserContext } from "../context/userContext";
import { Tooltip } from "@chakra-ui/react";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}`);
        setPost(response.data);
        setLikesCount(response.data.likes?.length || 0);
        setIsLiked(response.data.likes?.some(user => user._id === currentUser?.id));
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    const getReviews = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}/reviews`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    getPost();
    getReviews();
  }, [id, currentUser?.id]);

  const handleLike = async () => {
    if (!currentUser?.token) {
      console.error('User is not authenticated');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/posts/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      setIsLiked(true);
      setLikesCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error("Error liking the post:", error.response?.data || error.message);
    }
  };

  const handleUnlike = async () => {
    if (!currentUser?.token) {
      console.error('User is not authenticated');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/posts/${id}/unlike`, {}, {
        headers: { Authorization: `Bearer ${currentUser?.token}` }
      });
      setIsLiked(false);
      setLikesCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error("Error unliking the post:", error.response?.data || error.message);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!post) {
    return <p>No post found.</p>;
  }

  return (
    <section className="post-detail">
      {error && <p className="error">{error.message}</p>}
      {post && (
        <div className="container post-detail__container">
          <div className="post-detail__header">
            <PostAuthor authorID={post.creator} createdAt={post.createdAt} />
            {currentUser?.id === post?.creator && (
              <div className="post-detail__buttons">
                <Link to={`/posts/${post?._id}/edit`} className="btn sm primary">
                  Edit
                </Link>
                <DeletePost postId={id} />
                <p>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
              </div>
            )}
          </div>

          <h1>{post.title}</h1>
          <div className="post-detail__thumbnail">
            <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${post.thumbnail}`} alt={post.title} />
          </div>
          <p dangerouslySetInnerHTML={{ __html: post.description }}></p>

          {/* Like/Unlike Button with Tooltip */}
          {currentUser?.id !== post.creator?._id && (
            <div className="like-section">
              <Tooltip 
                label={
                  post.likes.length > 0 
                  ? post.likes.map(user => user.name).join(', ') 
                  : "No likes yet"
                }
                aria-label="Users who liked this post"
                hasArrow
              >
                <button
                  onClick={isLiked ? handleUnlike : handleLike}
                  className="btn"
                >
                  {isLiked ? "Unlike" : "Like"} ({likesCount})
                </button>
              </Tooltip>
            </div>
          )}

          {/* Review Section */}
          <div className="reviews">
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review">
                  <strong>By: {review.user?.name || 'Unknown User'}</strong>
                  <p>Comment: {review.comment}</p>
                  <p>Rating: {Array(review.rating).fill('⭐').join('')}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>

          {/* Review Form */}
          {currentUser && currentUser.id !== post.creator && (
            <ReviewForm postId={id} setReviews={setReviews} />
          )}
        </div>
      )}
    </section>
  );
};

export default PostDetail;



