const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');
const router = express.Router();

router.get('/recommendations/:userId', getRecommendations);
router.get('/:userId?', getRecommendations);

module.exports = router;
