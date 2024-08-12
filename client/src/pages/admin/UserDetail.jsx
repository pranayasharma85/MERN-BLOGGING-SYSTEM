import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDetail = () => {
    const { id } = useParams(); // Get the user ID from the URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/admin/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('User not found');
                } else {
                    setError('Failed to fetch user details. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="user-detail">
            <h1>User Details</h1>
            {user && (
                <div className="user-card">
                    <div className="user-card-content">
                    {user.avatar && (
                            <div className="user-avatar">
                                <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${user.avatar}`} alt={`${user.name}'s avatar`} />
                            </div>
                        )}
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> <span className={`role ${user.isAdmin ? 'admin-role' : 'user-role'}`}>{user.isAdmin ? 'Admin' : 'User'}</span></p>
                        <p><strong>Posts:</strong> {user.posts}</p>
                       
                       
                    </div>
                </div>
            )}
            <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};
export default UserDetail;
