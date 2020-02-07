const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');

router
  .route('/')
  .post(protect, authorize('user'), createReview)
  .get(protect, authorize('admin'), getReviews);

module.exports = router;
