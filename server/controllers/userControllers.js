
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')
const User = require('../models/userModel');
const HttpError = require('../models/errorModel');
const { log } = require('console')








//=============================REGISTER A NEW USER================================
//POST: api/users/register
//UNPROTECTED

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, password2,isAdmin} = req.body;
        console.log(req.body);
        if (!name || !email || !password) {
            return next(new HttpError("Fill in the all fields.", 422));
        }

        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
            return next(new HttpError("Email already exists.", 422));
        }
        if ((password.trim()).length < 6) {
            return next(new HttpError("Password should be at least 6 character", 422))

        }

        if (password != password2) {
            return next(new HttpError("Password Do not Match", 422))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt)
        const newUser = await User.create({ name, email: newEmail, password: hashedPass,isAdmin})
        res.status(201).json(`New user ${newUser.email} registered`);

    } catch (error) {
        console.error(error);
        return next(new HttpError("User registration failed", 500));
    }
};










//=============================LOGIN A REGISTERED USER================================
//POST: api/users/login
//UNPROTECTED
const loginUser = async (req, res, next) => {

    try {

        const { email, password } = req.body;
        if (!email || !password) {
            return next(new HttpError("Fill in all fields", 422));

        }

        const newEmail = email.toLowerCase();
        const user = await User.findOne({ email: newEmail });
        if (!user) {
            return next(new HttpError("User does not exist, Invalid credentials", 422));

        }
        const comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass) {
            return next(new HttpError("Invalid credentials", 422));

        }
        const { _id: id, name,isAdmin } = user;
        const token = jwt.sign({ id, name,isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.status(200).json({ token, id, name,isAdmin })

    } catch (error) {
        return next(new HttpError("User login failed, Please check your credentials", 422));

    }
}











//=============================USER PROFILE================================
//POST: api/users/:id
//PROTECTED
const getUser = async (req, res, next) => {
    try {

        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return next(new HttpError("User not found", 404))

        }
        res.status(200).json(user);

    } catch (error) {

        return next(new HttpError(error));


    }

}












//============================CHANGE USER AVATAR================================
//POST: api/users/change-avatar
//PROTECTED
const changeAvatar = async (req, res, next) => {
    try {
        if (!req.files || !req.files.avatar) {
            return next(new HttpError("Please choose an image.", 422));
        }

        // Find user from database
        const user = await User.findById(req.user.id);

        // Delete old avatar if exists
        if (user.avatar) {
            fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }

        const { avatar } = req.files;
        // Check file size
        if (avatar.size > 500000) {
            return next(new HttpError("Profile picture too big. Should be less than 500kb", 422));
        }

        let fileName;
        fileName = avatar.name;
        let splittedFilename = fileName.split('.');
        let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length - 1];

        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename));

        const updatedAvatar = await User.findByIdAndUpdate(req.user.id, { avatar: newFilename }, { new: true });
        if (!updatedAvatar) {
            return next(new HttpError("Avatar couldn't be changed", 422));
        }

        res.status(200).json(updatedAvatar);
    } catch (error) {
        return next(new HttpError(error));
    }
};













//=============================EDIT USER DETAILS===============================
//POST: api/users/edit-user
//PROTECTED
const editUser = async (req, res, next) => {

    try {

        const { name, email, currentPassword, newPassword, confirmNewPassword,isAdmin } = req.body;
        if (!name || !email || !currentPassword || !newPassword) {
            return next(new HttpError("fill in the all fields.", 422))

        }
        //get user from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new HttpError("User not found", 403));
        }

        //make sure new email doesnt already exists 
        const emailExist = await User.findOne({ email });
        if (emailExist && (emailExist._id != req.user.id)) {
            return next(new HttpError("Email already exists", 422));

        }

        //compare current password to database password 

        const validateUserPassword = await bcrypt.compare(currentPassword, user.password)
        if (!validateUserPassword) {
            return next(new HttpError("Invalid current password ", 422));

        }
        //compare new password to new confirm new password
        if (newPassword != confirmNewPassword) {
            return next(new HttpError("New password and confirm new password do not match", 422));
        }
        //hash new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        //update user details
        const newInfo = await User.findByIdAndUpdate(req.user.id, { name, email, password: hash,isAdmin:isAdmin!==undefined?isAdmin:user.isAdmin }, { new: true });
        res.status(200).json(newInfo);



    } catch (error) {

        return next(new HttpError(error))

    }
}












//===============================GET AUTHORS===============================
//POST: api/users/authors
//UNPROTECTED
const getAuthors = async (req, res, next) => {

    try {
        const authors = await User.find().select("-password")
        res.json(authors);


    } catch (error) {
        return next(new HttpError(error))

    }
}

module.exports = { registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors }

// // added isAdmin field 
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const fs = require('fs');
// const path = require('path');
// const { v4: uuid } = require('uuid');
// const User = require('../models/userModel');
// const HttpError = require('../models/errorModel');
// const { log } = require('console');

// // Register User
// const registerUser = async (req, res, next) => {
//     try {
//         const { name, email, password, password2, isAdmin } = req.body;
//         console.log(req.body);
//         if (!name || !email || !password) {
//             return next(new HttpError("Fill in all fields.", 422));
//         }

//         const newEmail = email.toLowerCase();
//         const emailExists = await User.findOne({ email: newEmail });
//         if (emailExists) {
//             return next(new HttpError("Email already exists.", 422));
//         }
//         if ((password.trim()).length < 6) {
//             return next(new HttpError("Password should be at least 6 characters", 422));
//         }

//         if (password != password2) {
//             return next(new HttpError("Passwords do not match", 422));
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPass = await bcrypt.hash(password, salt);
//         const newUser = await User.create({
//             name,
//             email: newEmail,
//             password: hashedPass,
//             isAdmin: isAdmin || false
//         });
//         res.status(201).json(`New user ${newUser.email} registered`);

//     } catch (error) {
//         console.error(error);
//         return next(new HttpError("User registration failed", 500));
//     }
// };

// // Login User
// const loginUser = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return next(new HttpError("Fill in all fields", 422));
//         }

//         const newEmail = email.toLowerCase();
//         const user = await User.findOne({ email: newEmail });
//         if (!user) {
//             return next(new HttpError("User does not exist, Invalid credentials", 422));
//         }

//         const comparePass = await bcrypt.compare(password, user.password);
//         if (!comparePass) {
//             return next(new HttpError("Invalid credentials", 422));
//         }

//         const { _id: id, name, isAdmin } = user;
//         const token = jwt.sign({ id, name, isAdmin }, process.env.JWT_SECRET, { expiresIn: "1d" });
//         res.status(200).json({ token, id, name, isAdmin });
//     } catch (error) {
//         return next(new HttpError("User login failed, Please check your credentials", 422));
//     }
// };

// // Get User
// const getUser = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const user = await User.findById(id).select('-password');
//         if (!user) {
//             return next(new HttpError("User not found", 404));
//         }
//         res.status(200).json(user);
//     } catch (error) {
//         return next(new HttpError(error));
//     }
// };

// // Change Avatar
// const changeAvatar = async (req, res, next) => {
//     try {
//         if (!req.files || !req.files.avatar) {
//             return next(new HttpError("Please choose an image.", 422));
//         }

//         const user = await User.findById(req.user.id);

//         if (user.avatar) {
//             fs.unlink(path.join(__dirname, '..', 'uploads', user.avatar), (err) => {
//                 if (err) {
//                     console.error(err);
//                 }
//             });
//         }

//         const { avatar } = req.files;
//         if (avatar.size > 500000) {
//             return next(new HttpError("Profile picture too big. Should be less than 500kb", 422));
//         }

//         let fileName;
//         fileName = avatar.name;
//         let splittedFilename = fileName.split('.');
//         let newFilename = splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length - 1];

//         avatar.mv(path.join(__dirname, '..', 'uploads', newFilename));

//         const updatedAvatar = await User.findByIdAndUpdate(req.user.id, { avatar: newFilename }, { new: true });
//         if (!updatedAvatar) {
//             return next(new HttpError("Avatar couldn't be changed", 422));
//         }

//         res.status(200).json(updatedAvatar);
//     } catch (error) {
//         return next(new HttpError(error));
//     }
// };

// // Edit User
// const editUser = async (req, res, next) => {
//     try {
//         const { name, email, currentPassword, newPassword, confirmNewPassword, isAdmin } = req.body;
//         if (!name || !email || !currentPassword || !newPassword) {
//             return next(new HttpError("Fill in all fields.", 422));
//         }

//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return next(new HttpError("User not found", 403));
//         }

//         const emailExist = await User.findOne({ email });
//         if (emailExist && (emailExist._id != req.user.id)) {
//             return next(new HttpError("Email already exists", 422));
//         }

//         const validateUserPassword = await bcrypt.compare(currentPassword, user.password);
//         if (!validateUserPassword) {
//             return next(new HttpError("Invalid current password", 422));
//         }

//         if (newPassword != confirmNewPassword) {
//             return next(new HttpError("New password and confirm new password do not match", 422));
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hash = await bcrypt.hash(newPassword, salt);

//         const newInfo = await User.findByIdAndUpdate(req.user.id, {
//             name,
//             email,
//             password: hash,
//             isAdmin: isAdmin !== undefined ? isAdmin : user.isAdmin
//         }, { new: true });

//         res.status(200).json(newInfo);
//     } catch (error) {
//         return next(new HttpError(error));
//     }
// };

// // Get Authors
// const getAuthors = async (req, res, next) => {
//     try {
//         const authors = await User.find().select("-password");
//         res.json(authors);
//     } catch (error) {
//         return next(new HttpError(error));
//     }
// };

// module.exports = { registerUser, loginUser, getUser, changeAvatar, editUser, getAuthors };