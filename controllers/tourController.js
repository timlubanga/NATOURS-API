const Tours = require('../models/toursmodels');
const qs = require('querystring');
const AppError = require('../utils/AppError');
exports.getAllTours = (req, res) => {
  console.log('hi');
  let query = {};
  if (Object.keys(req.query).length && Object.values(req.query)[0]) {
    query = JSON.stringify(req.query);
    // Advanced filtering
    query = query.replace(/\b(gte|gt|lt|lte)\b/g, match => {
      return `$${match}`;
    });
    query = JSON.parse(query);
  }

  const limit = +query.limit || 0;

  const items = (+query.pages - 1) * limit || 0;
  const sort = query.sort;
  const displayfields = query.displayfields
    ? query.displayfields.split(',').join(' ')
    : null;

  delete query.sort;
  delete query.displayfields;
  delete query.limit;
  delete query.pages;
  Tours.find(query)
    .sort(sort)
    .skip(items)
    // .select(displayfields)
    .limit(limit)
    .then(tours => {
      res.status(200).json({
        status: 'success',
        tours
      });
    })

    .catch(err => {
      err;
    });
};

exports.getTour = (req, res, next) => {
  Tours.findById(req.params.id)
    .then(tour => {
      if (!tour) {
        return next(new AppError('You entered wrong ID', 404));
      }
      res.status(200).json({
        tour
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.createTour = (req, res, next) => {
  Tours.create(req.body)
    .then(tours => {
      res.status(201).json({
        status: '201',
        data: tours
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.updateTour = (req, res, next) => {
  if (!Object.values(req.body).length || !Object.keys(req.body).length) {
    const err = new AppError('Please specify the key-value pair', 400);
    return next(err);
  }
  Tours.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  })
    .then(tour => {
      res.status(202).json({ message: 'success', tour: tour });
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteTour = (req, res, next) => {
  Tours.findByIdAndDelete(req.params.id)

    .then(data => {
      if (!data) {
        return next(new AppError('The record is not found', 404));
      }
      res.status(202).json({
        status: 'success',
        message: 'deleted'
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.getTopfive = (req, res, next) => {
  req.query.sort = 'price';
  req.query.limit = '5';
  next();
};

exports.monthlyPlan = async (req, res) => {
  const aggregates = [
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${req.params.year}-01-01`),
          $lte: new Date(`${req.params.year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        tourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    }
  ];

  if (req.query.month) {
    aggregates.push({
      $match: {
        month: {
          $eq: +req.query.month
        }
      }
    });
  }

  if (req.query.tourStarts) {
    aggregates.push(
      {
        $match: {
          tourStarts: +req.query.tourStarts
        }
      },

      {
        $group: {
          _id: null,
          Arraytours: {
            $push: '$tours'
          }
        }
      }
    );
  }

  Tours.aggregate([...aggregates])
    .then(results => {
      res.status(200).json({
        results
      });
    })
    .catch(err => {
      res.status(400).json({
        err
      });
    });
};

exports.groupBydifficulty = (req, res) => {
  Tours.aggregate([
    {
      $group: {
        _id: '$difficulty',
        totalPrice: { $sum: '$price' },
        AverageRating: {
          $avg: '$ratingsAverage'
        },
        highestPrice: {
          $max: '$price'
        }
      }
    },
    {
      $sort: { totalPrice: -1 }
    }
  ])
    .then(results => {
      res.status(200).json({
        results
      });
    })
    .catch(err => {
      res.status(404).json({
        err
      });
    });
};

exports.deleteAllTours = (req, res, next) => {
  Tours.deleteMany()
    .then(() => {
      res.status(204).json({
        message: 'deleted'
      });
    })
    .catch(err => {
      next(err);
    });
};
