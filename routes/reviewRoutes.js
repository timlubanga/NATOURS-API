const express = require('express');

const {
  createReview,
  getReviews,
  getOneReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, authorize('user'), createReview)
  .get(protect, getReviews);

router.route('/:id').get(getOneReview);
module.exports = router;
