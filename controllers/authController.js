const Users = require('../models/userModels');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const createToken = id => {
  return jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN
  });
};

const setToken = req => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  return token;
};
const verifyToken = (req, res, next) => {
  const token = setToken(req);
  if (token) {
    return promisify(jwt.verify)(token, process.env.JWT_SECRET)
      .then(decoded => {
        return { ...decoded, token };
      })
      .catch(err => {
        return err;
      });
  } else {
    return token;
  }
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

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const verify = await verifyToken(req, res, next);

  // check if the the token has expired
  if (verify && verify.name == 'TokenExpiredError') {
    const err = verify;
    return next(err);
  }

  //checks that the token has not expired yet
  else if (verify && verify.token) {
    res.status(200).json({
      message: 'You are logged in',
      token: verify.token
    });
  }
  // checks if the token has not been provided
  else if (!verify) {
    if (!email || !password) {
      return next(new AppError('please provide email or password', 400));
    }

    Users.findOne({ email: email })
      .select('+password')
      .then(async user => {
        let correct = false;
        if (user) {
          correct = await user.comparePasswords(password, user.password);
        }
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
        return next(err);
      });
  }
};

exports.protect = (req, res, next) => {
  const authenticated = verifyToken(req, res, next);
  if (!authenticated) {
    return next(new AppError('User not authenticated', 403));
  }
  authenticated.then(async verify => {
    //verify is the token is not expired or is provided
    if (!verify || verify.name) {
      return next(new AppError('Please again as the session has expired', 403));
      // check whether is valid
    } else if (verify && verify.token) {
      const user = await Users.findById(verify._id);
      if (!user) {
        return next(new AppError('The user does not exist', 401));
      }
      //check whether the token was issued before the password has been changed
      if (user.passChangeAfterTokenIssued(verify.iat)) {
        return next(new AppError('please login again. Password changed', 401));
      } else {
        req.user = user;
        next();
      }
    }
  });
};
exports.authorize = (...roles) => {
  return (req, res, next) => {
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

exports.reactivateAccount = (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('please provide email', 404));
  }

  Users.updateOne({ email: req.body.email }, { $set: { active: true } })
    .then(data => {
      next();
    })
    .catch(err => {
      next(err);
    });
};
