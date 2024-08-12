import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostDetail = () => {
    const { id } = useParams(); // Get the post ID from the URL
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/admin/posts/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setPost(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('Post not found');
                } else {
                    setError('Failed to fetch post details. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="post-detail">
            <h1>Post Details</h1>
            {post && (
                <div>
                    <p><strong>Title:</strong> {post.title}</p>
                    <p><strong>Category:</strong> {post.category}</p>
                    <p><strong>Content:</strong> {post.content}</p>
                    <p><strong>Creator:</strong> {post.creator.name} ({post.creator.email})</p>
                    {/* Add more post details here as needed */}
                </div>
            )}
            <button onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};

export default PostDetail;
