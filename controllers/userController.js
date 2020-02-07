const Users = require('../models/userModels');
const AppError = require('../utils/AppError');
const filterBody = (body, ...allowedFields) => {
  let newBody = {};
  for (key in body) {
    if (allowedFields.includes(key)) {
      newBody[key] = body[key];
    }
  }

  return newBody;
};

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res, next) => {
  const newBody = filterBody(req.body, 'name', 'email');
  Users.findByIdAndUpdate(req.user._id, newBody, { runValidators: true })
    .then(data => {
      res.status(200).json({
        message: 'success'
      });
    })
    .catch(err => {
      next(err);
    });
};
exports.deleteUser = (req, res, next) => {
  Users.findByIdAndUpdate(req.user._id, { active: false })
    .then(user => {
      res.status(200).json({
        user
      });
    })
    .catch(err => {
      next(err);
    });
};
