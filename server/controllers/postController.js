const Post = require('../models/postModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/errorModel');

//====================================CREATE A POST ============================
//POST: api/posts
//PROTECTED
const createPost = async (req, res, next) => {
    try {
        const { title, category, description } = req.body;
        if (!title || !category || !description || !req.files || !req.files.thumbnail) {
            return next(new HttpError('Please provide all the fields', 422));
        }

        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
            return next(new HttpError('Thumbnail size too big. Should be less than 2MB', 422));
        }

        const fileName = thumbnail.name;
        const splittedFilename = fileName.split('.');
        const newFilename = `${splittedFilename[0]}-${uuidv4()}.${splittedFilename[splittedFilename.length - 1]}`;

        const uploadPath = path.join(__dirname, '..', 'uploads', newFilename);

        thumbnail.mv(uploadPath, async (err) => {
            if (err) {
                return next(new HttpError(err.message, 500));
            }

            try {
                const newPost = await Post.create({ 
                    title, 
                    category, 
                    description, 
                    thumbnail: newFilename, 
                    creator: req.user.id, 
                    reviews: [],  // Initialize with an empty array
                    rating: 0     // Start with a rating of 0
                });

                if (!newPost) {
                    return next(new HttpError('Post could not be created', 422));
                }

                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

                res.status(201).json(newPost);
            } catch (error) {
                return next(new HttpError(error.message, 500));
            }
        });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};


//====================================ADD REVIEW TO A POST ============================
//POST: api/posts/:id/reviews
//PROTECTED
const createReview = async (req, res) => {
    try {
      const { comment, rating } = req.body;
  
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Check if the user has already reviewed this post
      const existingReview = post.reviews.find(review => review.user.toString() === req.user._id.toString());
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this post' });
      }
  
      // Add the new review
      post.reviews.push({
        user: req.user._id,
        comment,
        rating
      });
  
      await post.save();
  
      res.status(201).json(post.reviews[post.reviews.length - 1]);
    } catch (error) {
      res.status(400).json({ message: 'Error creating review' });
    }
  };
  
  
// //====================================GET ALL POSTS ============================
// //GET: api/posts
// //UNPROTECTED
// const getPosts = async (req, res, next) => {
//     try {
//         const posts = await Post.find().sort({ updatedAt: -1 });
//         res.status(200).json(posts);
//     } catch (error) {
//         return next(new HttpError(error.message, 500));
//     }
// };
//====================================GET ALL POSTS ============================
//GET: api/posts
//UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
  
      const totalPosts = await Post.countDocuments();
      const posts = await Post.find()
        .sort({ updatedAt: -1 })
        .skip(startIndex)
        .limit(limit);
  
      const totalPages = Math.ceil(totalPosts / limit);
  
      res.status(200).json({
        page,
        limit,
        totalPages,
        totalPosts,
        posts,
      });
    } catch (error) {
      next(new HttpError(error.message, 500));
    }
  };
  






  
  
  
  

//====================================GET SINGLE POST ============================
//GET: api/posts/:id
//UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        // Find post and populate the creator and likes fields
        const post = await Post.findById(postId)
            .populate('creator', 'name') // Populate creator with only name field (adjust as needed)
            .populate('likes', 'name'); // Populate likes with only name field (adjust as needed)

        if (!post) {
            return next(new HttpError("Post not found", 404));
        }

        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};
//====================================GET POSTS BY CATEGORY ============================
//GET: api/posts/categories/:category
//UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//====================================GET AUTHOR'S POSTS ============================
//GET: api/posts/users/:id
//UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//====================================EDIT A POST ============================
//PATCH: api/posts/:id
//PROTECTED
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFilename;
        let updatedPost;

        const postId = req.params.id;
        let { title, category, description, rating } = req.body;

        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all the fields", 422));
        }

        const oldPost = await Post.findById(postId);
        if (req.user.id == oldPost.creator) {
            if (!req.files) {
                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, rating }, { new: true });
            } else {
                fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                    if (err) {
                        return next(new HttpError(err));
                    }
                });

                const { thumbnail } = req.files;

                if (thumbnail.size > 2000000) {
                    return next(new HttpError("Thumbnail too big. Should be less than 2MB"));
                }
                fileName = thumbnail.name;
                let splittedFilename = fileName.split('.');
                newFilename = splittedFilename[0] + uuidv4() + "." + splittedFilename[splittedFilename.length - 1];
                thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
                    if (err) {
                        return next(new HttpError(err));
                    }
                });

                updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, rating, thumbnail: newFilename }, { new: true });
            }
        }

        if (!updatedPost) {
            return next(new HttpError("Post could not be updated", 500));
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//====================================DELETE A POST ============================
//DELETE: api/posts/:id
//PROTECTED
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return next(new HttpError("Post Unavailable", 400));
        }
        const post = await Post.findById(postId);
        const fileName = post?.thumbnail;
        if(req.user.id == post.creator) {
            fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
                if (err) {
                    return next(new HttpError(err));
                } else {
                    await Post.findByIdAndDelete(postId);

                    const currentUser = await User.findById(req.user.id);
                    const userPostCount = currentUser?.posts - 1;
                    await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
                    res.json(`Post ${postId} deleted Successfully`);
                }
            });
        } else {
            return next(new HttpError("Post couldn't be deleted", 403));
        }
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

//====================================GET REVIEWS FOR A POST ============================
//GET: api/posts/:id/reviews
//UNPROTECTED
const getReviews = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('reviews.user', 'name'); // Populate user details within reviews
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post.reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
};

  

const addReview = async (req, res) => {
    console.log("ADD REVIEW")
    const { postId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // Ensure that your authentication middleware sets req.user

    console.log(req.params, req.body)
  
    try {
      // Find the post
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found.' });
      }
  
      // Check if the user has already reviewed this post
      const existingReview = post.reviews.find(review => review.user.toString() === userId);
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this post.' });
      }
  
      // Add the new review
      post.reviews.push({ user: userId, comment, rating });
      let totalrating = post.reviews.reduce((acc, r) => acc + r.rating, 0);
      let totalreviews = post.reviews.length;
      post.rating = totalrating/totalreviews
      await post.save();
  
      res.status(201).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  const likePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: 'Post already liked by this user' });
        }

        post.likes.push(userId);
        await post.save();

        res.status(200).json({ message: 'Post liked successfully', post });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

  // Unlike a Post
  const unlikePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found", 404));
        }

        // Check if the user has not liked the post
        if (!post.likes.includes(userId)) {
            return res.status(400).json({ message: "Post not liked" });
        }

        // Remove user ID from the list of likes
        post.likes = post.likes.filter(like => like.toString() !== userId.toString());
        await post.save();

        res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

module.exports = { createPost, createReview, getPost, getPosts, getCatPosts, getUserPosts, editPost, deletePost,getReviews,addReview,likePost,unlikePost };
