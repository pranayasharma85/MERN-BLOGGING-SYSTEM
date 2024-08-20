import React, { useEffect, useState } from 'react';
import PostItem from './PostItem';
import Loader from '../components/Loader';
import axios from 'axios';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
        setPosts(response?.data);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

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
    </section>
  );
};

export default Posts;