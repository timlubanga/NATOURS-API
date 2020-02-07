const Users = require('../models/userModels');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

createToken = id => {
  return jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN
  });
};
exports.signup = (req, res, next) => {
  Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  })
    .then(newuser => {
      const token = createToken(newuser._id);
      res.status(201).json({
        token,
        message: 'created successfully',
        newuser
      });
    })
    .catch(err => next(err));
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  //check if email and password exist
  console.log('fuck');
  if (!email || !password) {
    return next(new AppError('please provide email or password', 400));
  }

  //check if user exists and password is correct
  //select deselected field explicitly by adding a plus sign
  Users.findOne({ email: email })
    .select('+password')
    .then(async user => {
      const correct = await user.comparePasswords(password, user.password);
      if (!user || !correct) {
        return next(new AppError('wrong password or email', 401));
      }

      const token = createToken(user._id);
      res.status(200).json({
        status: 'success',
        token
      });
    })
    .catch(err => {
      next(err);
    });
};

exports.protect = (req, res, next) => {
  //get the token and check if it has the correct format
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    next(new AppError('Please sign in to access the endpoint', 401));
  }

  //verify the token
  promisify(jwt.verify)(token, process.env.JWT_SECRET)
    .then(decoded => {
      return decoded;
    })
    .then(async decoded => {
      //check if the user still exists
      const user = await Users.findById(decoded._id);
      if (!user) {
        return next(new AppError('The user does not exist', 401));
      }

      if (user.passChangeAfterTokenIssued(decoded.iat)) {
        return next(new AppError('please login again. Password changed', 401));
      } else {
        req.user = user;
        next();
      }
    })
    .catch(err => {
      return next(err);
    });

  //check whether the token was issued before the password has been changed
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Sorry, not allowed to access this endpoint', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = (req, res, next) => {
  //get user based on posted email
  Users.findOne({ email: req.body.email }).then(async user => {
    if (!user) return next(new AppError('no address found', 404));

    const resetToken = user.generateResetToken();
    user.save({ validateBeforeSave: false }).then(async newuser => {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/resetPassword/${resetToken}`;

      const message = `Fortgot your password? Do not worry, 
      kindly submit a request to reset it using the link provided ${resetURL}`;
      try {
        const info = await sendEmail({
          email: 'timlubanga@gmail.com',
          subject: 'your password reset token valid for 10 min',
          message: message
        });
        console.log(resetToken);
        res.status(200).json({
          message: 'success',
          info
        });
      } catch (error) {
        (user.passwordResetToken = undefined),
          (user.passwordTokenExpiresAt = undefined),
          await user.save({ validateBeforeSave: false });
        return next(error);
      }
    });
  });
};

exports.resetPassword = (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  Users.findOne({
    passwordResetToken: hashedToken,
    passwordTokenExpiresAt: { $gt: Date.now() }
  }).then(user => {
    if (!user) {
      return next(new AppError('the token has expired or is incorrect', 403));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    (user.passwordResetToken = undefined),
      (user.passwordTokenExpiresAt = undefined),
      (user.passwordChangeAt = Date.now());
    user.save({ validateBeforeSave: true }).then(user => {
      const token = createToken(user._id);
      res.status(200).json({
        status: 'success',
        token
      });
    });
  });
  //if the token has not expired, and there is user,set the new password
  //update changedPasswordAt property for the user
  //log the user in send jwt
};

exports.updateMyPassword = (req, res, next) => {
  Users.findById(req.user._id).then(newuser => {
    if (!newuser) {
      next(new AppError('The user does not exist anymore', 404));
    }
    newuser.password = req.body.password;
    newuser.confirmPassword = req.body.confirmPassword;
    newuser.passwordChangeAt = Date.now();
    newuser
      .save()
      .then(data => {
        res.status(200).json({
          message: 'password changed successfully',
          status: 'success',
          data
        });
      })
      .catch(err => {
        next(new AppError(err));
      });
  });
};
