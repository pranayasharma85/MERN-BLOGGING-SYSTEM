const express = require('express');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Post = require('../models/postModel');
const adminMiddleware = require('../middleware/admin');
const bcrypt = require("bcryptjs");

const router = express.Router();

// Admin Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Sign JWT
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return token and user information including isAdmin
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all posts
router.get('/posts', adminMiddleware, async (req, res) => {
    try {
        const posts = await Post.find().populate('creator', 'name email');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get details of a specific user by ID
router.get('/users/:id', adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get details of a specific post by ID
router.get('/posts/:id', adminMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('creator', 'name email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
