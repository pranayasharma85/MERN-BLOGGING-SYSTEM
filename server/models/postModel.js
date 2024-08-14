const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  thumbnail: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviews: [reviewSchema], // Embedded review schema
  rating: { type: Number, default: 0 },
  // other fields...
});

module.exports = mongoose.model('Post', postSchema);
