const mongoose = require('mongoose');
const TourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'The field cannot be empty'],
      unique: true
    },
    duration: Number,
    maxGroupSize: {
      type: Number,
      required: [true, 'please specify maximum group size']
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'please easy or difficult'],
      enum: ['easy', 'difficult', 'medium']
    },
    ratingsAverage: {
      type: Number,
      min: 0,
      max: 5
    },
    ratingsQuantity: {
      type: Number,
      required: [true, 'quantity cannot be empty']
    },

    price: {
      type: Number,
      required: [true, 'please specify the price']
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'please fill out the summary']
    },

    description: {
      type: String,
      required: [true, 'please fill out the description']
    },

    imageCover: {
      type: String,
      required: [true, 'please fill out the imageCover']
    },
    images: [String],
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: [Number]
      }
    ],
    reviewNum: {
      type: Number,
      default: 0
    },

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]

    //
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
// TourSchema.set('toObject', { virtuals: true });
// TourSchema.set('toJSON', { virtuals: true });
// TourSchema.post('aggregate', function(next) {
//   next();
//   console.log(this);
// });
TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
TourSchema.pre(/^find/, function() {
  this.populate({
    path: 'reviews',
    select: '-__v '
  });
});

TourSchema.pre(/^find/, function() {
  this.populate({
    path: 'guides'
  });
});

const TOUR = mongoose.model('TOUR', TourSchema);

module.exports = TOUR;
