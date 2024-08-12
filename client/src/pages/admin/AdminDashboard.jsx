import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../../context/adminContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { isAdmin } = useContext(AdminContext);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [usersResponse, postsResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BASE_URL}/admin/users`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/admin/posts`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                ]);

                setUsers(usersResponse.data);
                setPosts(postsResponse.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    // If unauthorized, redirect to login
                    navigate('/admin/login');
                } else {
                    setError('Failed to fetch data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin, navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <section className="admin-section">
                <h2>Users Detail:</h2>
                {users.length > 0 ? (
                    <div className="card-container">
                        {users.map(user => (
                            <div key={user._id} className="card user-card">
                                <div className="card-content">
                                    <h3>{user.name}</h3>
                                    <p>{user.email}</p>
                                    <p className={`role ${user.isAdmin ? 'admin-role' : 'user-role'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </p>
                                    <Link to={`/admin/users/${user._id}`} className="card-link">View Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No users found.</p>
                )}
            </section>

            <section className="admin-section">
                <h2>Posts Detail:</h2>
                {posts.length > 0 ? (
                    <div className="card-container">
                        {posts.map(post => (
                            <div key={post._id} className="card post-card">
                                <div className="card-content">
                                    <h3>{post.title}</h3>
                                    <p>{post.category}</p>
                                    <p>by {post.creator.name}</p>
                                    <Link to={`/admin/posts/${post._id}`} className="card-link">View Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No posts found.</p>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;
