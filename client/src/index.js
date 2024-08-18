import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import Authors from './pages/Authors';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import DeletePost from './pages/DeletePost';
import CategoryPosts from './pages/CategoryPosts';
import AuthorsPosts from './pages/AuthorPosts';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';
import UserProvider from './context/userContext';
import AdminProvider from './context/adminContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import UserDetail from './pages/admin/UserDetail';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <UserProvider>
        <AdminProvider>
          <Layout />
        </AdminProvider>
      </UserProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:id', element: <PostDetail /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'profile/:id', element: <UserProfile /> },
      { path: 'authors', element: <Authors /> },
      { path: 'create', element: <CreatePost /> },
      { path: 'posts/categories/:category', element: <CategoryPosts /> },
      { path: 'posts/users/:id', element: <AuthorsPosts /> },
      { path: 'myposts/:id', element: <Dashboard /> },
      { path: 'posts/:id/edit', element: <EditPost /> },
      { path: 'posts/:id/delete', element: <DeletePost /> },
      { path: 'logout', element: <Logout /> },
      { path: 'admin/login', element: <AdminLogin /> },
      { path: 'admin/dashboard', element: <AdminDashboard /> },
      { path: 'admin/users/:id', element: <UserDetail /> }, // Updated to dynamic route
      { path: 'admin/posts/:id', element: <PostDetail /> }, // Updated to dynamic route
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <ToastContainer/>
  </React.StrictMode>
);
