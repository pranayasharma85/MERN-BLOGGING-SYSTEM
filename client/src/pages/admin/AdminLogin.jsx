import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../../context/adminContext';

const AdminLogin = () => {
    const [userData, setUserData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setIsAdmin } = useContext(AdminContext);

    const changeInputHandler = (e) => {
        setUserData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const loginUser = async (e) => {
        e.preventDefault();
        setError('');
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/admin/login`, userData);
            
            if (response && response.data && response.data.user) {
                const user = response.data.user;
                const token = response.data.token;

                // Store the token in local storage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user)); // Store the user info including isAdmin
                
                // Set the admin context
                if (user.isAdmin) {
                    setIsAdmin(true); // Set isAdmin in AdminContext
                    navigate('/admin/dashboard');
                } else {
                    setError('You are not authorized to access this area.');
                }
            } else {
                setError('Invalid response from server');
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'An error occurred');
            } else {
                setError('Server is not responding. Please try again later.');
            }
        }
    };

    return (
        <section className="login">
            <div className="container">
                <h2>Admin Sign In</h2>
                <form className="form login__form" onSubmit={loginUser}>
                    {error && <p className='form__error-message'>{error}</p>}
                    <input type='text' placeholder='Email' name='email' value={userData.email} onChange={changeInputHandler} autoFocus />
                    <input type='password' placeholder='Password' name='password' value={userData.password} onChange={changeInputHandler} />
                    <button type="submit" className='btn primary'>Login</button>
                </form>
            </div>
        </section>
    );
};

export default AdminLogin;
