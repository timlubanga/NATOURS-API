const moongose = require('mongoose');

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

// reviewSchema.pre(/^find/, function() {
//   this.select('-__v');
// });
reviewSchema.pre(/^find/, function() {
  this.populate({
    //   path: 'tour',
    //   select: 'name -guides'
    // }).populate({
    path: 'user'
  });
});

// reviewSchema.post(/^find/, function(doc) {
//   doc.select('-tour');
// });

const Review = moongose.model('Review', reviewSchema);
module.exports = Review;
