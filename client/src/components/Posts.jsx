// import React, { useEffect, useState } from 'react';
// import PostItem from './PostItem';
// import Loader from '../components/Loader';
// import axios from 'axios';

// const Posts = () => {
//   const [posts, setPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
//         setPosts(response?.data);
//       } catch (err) {
//         console.log(err);
//       }
//       setIsLoading(false);
//     };
//     fetchPosts();
//   }, []);

//   if (isLoading) {
//     return <Loader />;
//   }

//   return (
//     <section className='posts'>
//       <h1>Posts Available</h1>
//       {posts.length > 0 ? (
//         <div className='container posts__container'>
//           {posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt, rating, reviews }) => (
//             <PostItem
//               key={id}
//               postID={id}
//               thumbnail={thumbnail}
//               category={category}
//               title={title}
//               description={description}
//               authorID={creator}
//               createdAt={createdAt}
//               rating={rating}
//               reviews={reviews}
//             />
//           ))}
//         </div>
//       ) : (
//         <h2 className='center'>No Posts Found</h2>
//       )}
//     </section>
//   );
// };

// export default Posts;

import React, { useEffect, useState } from 'react';
import PostItem from './PostItem';
import Loader from '../components/Loader';
import axios from 'axios';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`, {
          params: {
            page: currentPage,
            limit: postsPerPage
          }
        });
        setPosts(response.data.posts);
        setTotalPosts(response.data.totalPosts);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, [currentPage, postsPerPage]);

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageSelect = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className='posts'>
      <h1>Posts Available</h1>
      {posts.length > 0 ? (
        <div className='container posts__container'>
          {posts.map(({ _id: id, thumbnail, category, title, description, creator, createdAt, rating, reviews }) => (
            <PostItem
              key={id}
              postID={id}
              thumbnail={thumbnail}
              category={category}
              title={title}
              description={description}
              authorID={creator}
              createdAt={createdAt}
              rating={rating}
              reviews={reviews}
            />
          ))}
        </div>
      ) : (
        <h2 className='center'>No Posts Found</h2>
      )}
      <div className="pagination-container">
        <button
          className="pagination-button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages).keys()].map((number) => (
          <button
            key={number + 1}
            className={`pagination-button ${currentPage === number + 1 ? 'active' : ''}`}
            onClick={() => handlePageSelect(number + 1)}
          >
            {number + 1}
          </button>
        ))}
        <button
          className="pagination-button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default Posts;



