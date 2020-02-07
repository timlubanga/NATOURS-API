const AppError = require('../utils/AppError');

const sendToDevelopment = (err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
      stack: err.stack
    });

    return;
  } else {
    res.status(500).json({
      err
    });
    return;
  }
};

const sendToProduction = (err, req, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV == 'development') {
    return sendToDevelopment(err, req, res);
  } else if (process.env.NODE_ENV == 'production') {
    let error = err;
    if (err.name == 'CastError') {
      error = new AppError('Sorry, you entered wrong ID', 404);
    } else if (err.name == 'ValidationError') {
      const errors = Object.values(err.errors)
        .map(el => {
          return el.message;
        })
        .join(' ');
      error = new AppError(errors, 400);
    } else if (err.name == 'MongoError') {
      error = new AppError(err.errmsg, 400);
    }

    sendToProduction(error, req, res);
  }
};

module.exports = errorHandler;
