const express = require('express');
const userController = require('./../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
  protect
} = require('../controllers/authController');

const router = express.Router();
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updateMyPassword').patch(protect, updateMyPassword);

router.route('/signup').post(signup);
router.route('/login').post(login);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .patch(protect, userController.updateUser);

router
  .route('/:id')
  .get(userController.getUser)
  .delete(protect, userController.deleteUser);

router.route('/forgotPassword').post(forgotPassword);

module.exports = router;
