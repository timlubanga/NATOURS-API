const moongose = require('mongoose');
const Tour = require('./toursmodels');
const AppError = require('../utils/AppError');
const reviewSchema = moongose.Schema({
  rating: {
    type: Number,
    required: [true, 'please provide a rating'],
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: [true, 'please provide a description']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: moongose.Schema.ObjectId,
    ref: 'TOUR'
  },
  user: {
    type: moongose.Schema.ObjectId,
    ref: 'User'
  }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.CalculateAverageRating = function(tourId) {
  this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: 'tour',
        nRating: { $sum: 1 },
        average: { $avg: '$rating' }
      }
    },

    {
      $project: {
        average: 1,
        nRating: 1
      }
    }
  ])
    .then(results => {
      Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: results[0].average,
        ratingsQuantity: results[0].nRating
      })
        .then(() => {
          console.log('updated');
        })
        .catch(() => {
          console.log('An error occured');
        });
    })
    .catch(err => {
      return AppError(err, 400);
    });
};

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    //   path: 'tour',
    //   select: 'name -guides'
    // }).populate({
    path: 'user'
  });
  next();
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  // this.model.findOne(this.getQuery(),(doc)=>{
  //   c
  this.review = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, function() {
  this.review.constructor.CalculateAverageRating(this.review.tour);
});

reviewSchema.post('save', function() {
  this.constructor.CalculateAverageRating(this.tour);
});

const Review = moongose.model('Review', reviewSchema);
module.exports = Review;
