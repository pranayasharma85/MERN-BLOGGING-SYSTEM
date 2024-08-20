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

    const likedPosts = await Post.find({ likes: userId }).select('_id likes');
    const reviewedPosts = await Post.find({ 'reviews.user': userId }).select('_id reviews');

    // Initialize an empty array to hold the final recommendations
    let finalRecommendations = [];

    if ((likedPosts.length === 0 && reviewedPosts.length === 0) || (!likedPosts.length && !reviewedPosts.length)) {
      // If the user has no interactions, recommend the top liked and highest-rated posts
      const topPosts = await Post.find()
        .sort({ likes: -1, rating: -1 }) // Sort by likes and then by rating
        .limit(10); // Limit to top 10 posts
      return res.status(200).json(topPosts);
    }

    // Collect all users who liked/reviewed the same posts
    const similarUserIds = [
      ...new Set([
        ...(likedPosts || []).flatMap(post => post.likes || []),
        ...(reviewedPosts || []).flatMap(post => (post.reviews || []).map(review => review.user))
      ])
    ].filter(id => id.toString() !== userId); // Remove the current user from the list

    // Ensure similarUserIds is an array and not empty
    if (!similarUserIds.length) {
      const topPosts = await Post.find()
        .sort({ likes: -1, rating: -1 })
        .limit(10);
      return res.status(200).json(topPosts);
    }

    // Find posts liked/reviewed by similar users that the current user hasn't interacted with
    const recommendedPosts = await Post.find({
      _id: {
        $nin: [
          ...(likedPosts || []).map(post => post._id),
          ...(reviewedPosts || []).map(post => post._id)
        ]
      },
      $or: [
        { likes: { $in: similarUserIds } },
        { 'reviews.user': { $in: similarUserIds } }
      ]
    })
      .sort({ likes: -1, rating: -1 })
      .limit(10);

    // Add the collaborative filtering recommendations to the final list
    finalRecommendations.push(...recommendedPosts);

    // Fetch the top 5 most liked posts that are not already recommended
    const mostLikedPosts = await Post.find({
      _id: {
        $nin: finalRecommendations.map(post => post._id)
      }
    })
      .sort({ likes: -1 })
      .limit(5);

    // Fetch the top 5 best-rated posts that are not already recommended
    const bestRatedPosts = await Post.find({
      _id: {
        $nin: finalRecommendations.map(post => post._id)
      }
    })
      .sort({ rating: -1 })
      .limit(5);

    // Merge the results
    finalRecommendations.push(...mostLikedPosts, ...bestRatedPosts);

    // Remove duplicates by converting to a Map, then back to an array
    finalRecommendations = [...new Map(finalRecommendations.map(post => [post._id.toString(), post])).values()];

    res.status(200).json(finalRecommendations.slice(0, 10)); // Limit to 10 posts total
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
};
