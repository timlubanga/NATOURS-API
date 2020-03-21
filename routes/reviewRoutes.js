const express = require('express');

const {
  createReview,
  getReviews,
  getOneReview,
  adduserAndtourId,
  updateReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, authorize('user'), adduserAndtourId, createReview)
  .get(protect, getReviews);

router
  .route('/:id')
  .get(getOneReview)
  .patch(protect, authorize('user'), updateReview);
module.exports = router;
