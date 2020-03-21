const Tours = require('../models/toursmodels');
const qs = require('querystring');
const AppError = require('../utils/AppError');
const multer = require('multer');
const sharp = require('sharp');
const {
  getOneRecord,
  getAllRecords,
  deleteAllRecords,
  deleteOneRecord,
  updateRecord,
  createDoc
} = require('./HandlerFactory');
exports.getAllTours = getAllRecords(Tours);
exports.getTour = getOneRecord(Tours);
exports.createTour = createDoc(Tours);
exports.updateTour = updateRecord(Tours);
exports.deleteTour = deleteOneRecord(Tours);
exports.deleteAllTours = deleteAllRecords(Tours);

const storage = multer.memoryStorage();
const filterFiles = (req, file, cb) => {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  if (!file.mimetype.startsWith('image'))
    return cb(new AppError('file not accepted'));
  // To accept the file pass `true`, like so:
  else cb(null, true);
};

const upload = multer({ storage, fileFilter: filterFiles });

exports.processFiles = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

exports.resizePhotos = (req, res, next) => {
  if (!req.files) return next();

  if (req.files.imageCover) {
    req.body.imageCover = `imageCover-${req.user.id}-${Date.now()}.jpeg`;
    sharp(req.files.imageCover[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .toFile(`public/img/users/${req.body.imageCover}`)
      .then(() => {})
      .catch(err => {
        return next(err);
      });
  }

  if (req.files.images) {
    req.body.images = [];
    Promise.all(
      req.files.images.map(async (file, index) => {
        const filename = `tourphoto-${req.user.id}-${Date.now()}-${index +
          1}.jpeg`;

        await sharp(file.buffer)
          .resize(1000, 1500)
          .toFormat('jpeg')
          .toFile(`public/img/users/${filename}`);
        req.body.images.push(filename);
      })
    )
      .then(() => {
        return next();
      })
      .catch(err => {
        next(err);
      });
  } else return next();
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
