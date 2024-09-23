// const Post = require('../models/postModel');
// const User = require('../models/userModel');

// exports.getRecommendations = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Fetch the user's liked and reviewed posts
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const likedPosts = await Post.find({ likes: userId }).select('_id likes');
//     const reviewedPosts = await Post.find({ 'reviews.user': userId }).select('_id reviews');

//     // Initialize an empty array to hold the final recommendations
//     let finalRecommendations = [];

//     // If the user has no interactions, recommend the top liked and highest-rated posts
//     if (likedPosts.length === 0 && reviewedPosts.length === 0) {
//       const topPosts = await Post.find()
//         .sort({ likes: -1, rating: -1 })
//         .limit(10);
//       return res.status(200).json(topPosts);
//     }

//     // Collect all users who liked/reviewed the same posts
//     const similarUserIds = [
//       ...new Set([
//         ...likedPosts.flatMap(post => post.likes || []),
//         ...reviewedPosts.flatMap(post => post.reviews.map(review => review.user))
//       ])
//     ].filter(id => id.toString() !== userId); // Exclude the current user

//     // If no similar users, return top liked and highest-rated posts
//     if (!similarUserIds.length) {
//       const topPosts = await Post.find()
//         .sort({ likes: -1, rating: -1 })
//         .limit(10);
//       return res.status(200).json(topPosts);
//     }

//     // Find posts liked/reviewed by similar users that the current user hasn't interacted with
//     const recommendedPosts = await Post.find({
//       _id: {
//         $nin: [
//           ...likedPosts.map(post => post._id),
//           ...reviewedPosts.map(post => post._id)
//         ]
//       },
//       $or: [
//         { likes: { $in: similarUserIds } },
//         { 'reviews.user': { $in: similarUserIds } }
//       ]
//     })
//       .sort({ likes: -1, rating: -1 })
//       .limit(10);

//     // Prioritize posts liked by similar users
//     finalRecommendations.push(...recommendedPosts);

//     // Fetch the top 5 most liked posts that are not already recommended
//     const mostLikedPosts = await Post.find({
//       _id: { $nin: finalRecommendations.map(post => post._id) }
//     })
//       .sort({ likes: -1 })
//       .limit(5);

//     // Fetch the top 5 best-rated posts that are not already recommended
//     const bestRatedPosts = await Post.find({
//       _id: { $nin: finalRecommendations.map(post => post._id) }
//     })
//       .sort({ rating: -1 })
//       .limit(5);

//     // Merge and deduplicate recommendations
//     finalRecommendations.push(...mostLikedPosts, ...bestRatedPosts);
//     finalRecommendations = [...new Map(finalRecommendations.map(post => [post._id.toString(), post])).values()];

//     // Limit to 10 recommendations
//     res.status(200).json(finalRecommendations.slice(0, 10));
//   } catch (error) {
//     console.error('Error fetching recommendations:', error.message);
//     res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
//   }
// };


const Post = require('../models/postModel');
const User = require('../models/userModel');

exports.getRecommendations = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the user's liked and reviewed posts
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const likedPosts = await Post.find({ likes: userId }).select('_id category likes');
    const reviewedPosts = await Post.find({ 'reviews.user': userId }).select('_id category reviews');

    // Collect all categories the user has interacted with
    const interactedCategories = [
      ...new Set([
        ...likedPosts.map(post => post.category),
        ...reviewedPosts.map(post => post.category)
      ])
    ];

    // Initialize an empty array to hold the final recommendations
    let finalRecommendations = [];

    // If the user has no interactions, recommend the top liked and highest-rated posts
    if (likedPosts.length === 0 && reviewedPosts.length === 0) {
      const topPosts = await Post.find()
        .sort({ likes: -1, rating: -1 })
        .limit(10);
      return res.status(200).json(topPosts);
    }

    // Find posts within the same categories that the user has interacted with
    const categoryPosts = await Post.find({
      category: { $in: interactedCategories },
      _id: { $nin: [
        ...likedPosts.map(post => post._id),
        ...reviewedPosts.map(post => post._id)
      ]}
    }).sort({ likes: -1, rating: -1 }).limit(10);

    // Add the category-based posts to the final recommendations
    finalRecommendations.push(...categoryPosts);

    // If there aren't enough posts, fetch additional recommendations
    if (finalRecommendations.length < 10) {
      const additionalPosts = await Post.find({
        _id: { $nin: finalRecommendations.map(post => post._id) }
      }).sort({ likes: -1, rating: -1 }).limit(10 - finalRecommendations.length);

      finalRecommendations.push(...additionalPosts);
    }

    // Merge and deduplicate recommendations
    finalRecommendations = [...new Map(finalRecommendations.map(post => [post._id.toString(), post])).values()];

    // Limit to 10 recommendations
    res.status(200).json(finalRecommendations.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
};
