const express = require('express');
const errorHandler = require('./controllers/errorHandleController');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

// connect to database
require('./dbConnection');

const app = express();
// 1) MIDDLEWARES
//setting security http headers
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//rate limiting to prevent two many requests and brute force attack
const rateLimiter = rateLimit({
  max: 5000,
  windowMs: 60 * 60 * 1000
});
app.use('/api', rateLimiter);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//data sanitization, against nosql query injetion

app.use(mongoSanitize());
//data sanitization, against xss attacks
app.use(xssClean());

//prevent parameter pollution
app.use(hpp());
// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  const err = new AppError('This endpoint is not available', 404);
  next(err);
});

app.use(errorHandler);

module.exports = app;
