const express = require('express');
const router = express.Router({ mergeParams: true });
const { getReviews, createReview } = require('../controllers/reviewController');
const authenticate = require('../middleware/auth');

// Mounted at /api/reviews/:courseId
router.get('/:courseId', getReviews);
router.post('/:courseId', authenticate, createReview);

module.exports = router;
