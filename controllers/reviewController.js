const Review = require('../models/reviewModels');
const {
  createDoc,
  getAllRecords,
  getOneRecord,
  deleteAllRecords,
  updateRecord
} = require('./HandlerFactory');

exports.adduserAndtourId = (req, res, next) => {
  if (req.params.tourId) {
    req.body.tour = req.params.tourId;
  }
  if (req.user) {
    req.body.user = req.user._id;
  }
  next();
};

exports.createReview = createDoc(Review);
exports.getReviews = getAllRecords(Review);
exports.getOneReview = getOneRecord(Review);
exports.deleteReviews = deleteAllRecords(Review);
exports.updateReview = updateRecord(Review);
