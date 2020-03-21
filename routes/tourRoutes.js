const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheapest-tours')
  .get(tourController.getTopfive, tourController.getAllTours);

router.route('/groupBydifficulty').get(tourController.groupBydifficulty);

router.route('/mothlyPlan/:year').get(tourController.monthlyPlan);
// router
//   .route('/tours-within/:distance/center/:latlng/unit/:unit')
//   .get(tourController.getToursWithin);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.createTour)
  .delete(tourController.deleteAllTours);

// router
//   .route('/calculateDistanceFromPoint/location/:latlng')
//   .get(tourController.calculateDistanceTofromPoint);

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    tourController.processFiles,
    tourController.resizePhotos,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.authorize('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
