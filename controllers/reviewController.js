const Review = require('../models/revieModels');

exports.createReview = (req, res, next) => {
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
  Review.find()
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
