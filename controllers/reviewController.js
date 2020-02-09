const Review = require('../models/reviewModels');

exports.createReview = (req, res, next) => {
  if (req.params.tourId) {
    req.body.tour = req.params.tourId;
  }
  if (req.user) {
    req.body.user = req.user._id;
  }
  Review.create(req.body)
    .then(data => {
      res.status(201).json({
        message: 'successfully',
        data
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.getReviews = (req, res, next) => {
  let tour;
  if (req.params.tourId) {
    tour = { tour: req.params.tourId };
  }
  Review.find(tour)
    .then(data => {
      res.status(200).json({
        message: 'successfully',
        reviews: data
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.getOneReview = (req, res, next) => {
  Review.findById(req.params.id)
    .then(data => {
      res.status(200).json({
        message: 'successfully',
        data
      });
    })
    .catch(err => {
      next(err);
    });
};
