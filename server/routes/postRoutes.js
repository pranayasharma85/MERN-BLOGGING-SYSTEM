const { Router } = require('express');
const { 
    createPost, 
    getPost, 
    getPosts, 
    getCatPosts, 
    getUserPosts, 
    editPost, 
    deletePost, 
    createReview,     // Add createReview function
    getReviews,        // Add getReviews function
    addReview,
    likePost,
    unlikePost
} = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// Post-related routes
router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.get('/categories/:category', getCatPosts);
router.get('/users/:id', getUserPosts);
router.patch('/:id', authMiddleware, editPost);
router.delete('/:id', authMiddleware, deletePost);

// Review-related routes
// router.post('/:id/reviews', authMiddleware, createReview); // Create a review
router.get('/:id/reviews', getReviews);                    // Get all reviews for a post
router.post('/:postId/reviews', authMiddleware, addReview);


router.post('/:id/like', authMiddleware, likePost);      // Like a post
router.post('/:id/unlike', authMiddleware, unlikePost);  // Unlike a post


module.exports = router;