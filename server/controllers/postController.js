
const Post = require('../models/postModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/errorModel');
const { post } = require('../routes/postRoutes');

//...

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
                const newPost = await Post.create({ title, category, description, thumbnail: newFilename, creator: req.user.id});
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














//====================================GET ALL POST ============================
//GET: api/posts
//UNPROTECTED
const getPosts = async (req, res, next) => {
    try {


        const posts = await Post.find().sort({ updatedAt: -1 });
        res.status(200).json(posts);

    } catch (error) {
        return next(new HttpError(error));
    }
}












//====================================GET SINGLE  POST ============================
//GET: api/posts/:id
//UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found", 404));
        }
        res.status(200).json(post);


    } catch (error) {
        return next(new HttpError(error));

    }
}








//====================================GET POST BY CATEGORY ============================
//GET: api/posts/categories/:category
//UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 })
        res.status(200).json(catPosts);


    } catch (error) {
        return next(new HttpError(error));

    }









}

//====================================GET AUTHOR POST ============================
//GET: api/posts/users/:id
//UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {


        const { id } = req.params;
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error));



    }
}









//====================================EDIT a POST ============================
//PATCH: api/posts/:id
//PROTECTED
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFilename;
        let updatedPost;

        const postId = req.params.id;
        let { title, category, description } = req.body;

        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all the field", 422))

        }

        //get old post from database 
        const oldPost=await Post.findById(postId);
        if(req.user.id==oldPost.creator)
        {
        if (!req.files) {
            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description}, { new: true });

        }
        else {

            fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
                if (err) {
                    return next(new HttpError(err));

                }



            })
            //upload a new thumbnail 
            const { thumbnail } = req.files;

            //check the file size
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail too big. Should be less than 2mb"))
            }
            fileName = thumbnail.name;
            let splittedFilename = fileName.split('.')
            newFilename = splittedFilename[0] + uuidv4() + "." + splittedFilename[splittedFilename.length - 1]
            thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
                if (err) {
                    return next(new HttpError(err));

                }
            })

            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFilename}, { new: true });
        }
    }


        if (!updatedPost) {
            return next(new HttpError(error));
        }

        res.status(200).json(updatedPost);



    }
  catch (error) {
        return next(new HttpError(error));


    }
}




//====================================DELETE a POST ============================
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
        if(req.user.id==post.creator)
        {


        //delete thumbnail from uploads folder 

        fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
            if (err) {
                return next(new HttpError(err));

            }
            else {
                await Post.findByIdAndDelete(postId);

                //find user and reduce post count by one 
                const currentUser = await User.findById(req.user.id);
                const userPostCount = currentUser?.posts - 1;
                await User.findByIdAndDelete(req.user.id, { posts: userPostCount })
                res.json(`Post ${postId} deleted Successfully`);
            }
        })

    }
    else 
    {
        return next(new HttpError("Post couldn't be Deleted",403))
    }
}
    
    catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = { createPost, getPost, getPosts, getCatPosts, getUserPosts, editPost, deletePost };