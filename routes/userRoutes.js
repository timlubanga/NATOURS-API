const express = require('express');
const userController = require('./../controllers/userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
  protect,
  reactivateAccount
} = require('../controllers/authController');

const router = express.Router();
router
  .route('/getMe')
  .get(protect, userController.getMe, userController.getUser);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updateMyPassword').patch(protect, updateMyPassword);

router.route('/signup').post(signup);
router.post('/login', reactivateAccount, login);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .patch(
    protect,
    userController.processFiles,
    userController.resizeUserPhoto,
    userController.filterBodyForUpdate,
    userController.updateUser
  )
  .delete(protect, userController.deleteUser);

router.route('/:id').get(userController.getUser);

router.route('/forgotPassword').post(forgotPassword);

module.exports = router;
