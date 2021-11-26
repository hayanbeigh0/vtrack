const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/getMyProfile', authController.protect, userController.getProfile);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

// ------------- WORK AROUND - REMOVING HTTP METHODS

router.post('/resetPassword/:token', authController.resetPassword);
router.post(
   '/updatePassword',
   authController.protect,
   authController.updatePassword
);

router.post('/updateMe', authController.protect, userController.updateMe);
router.get('/deleteMe', authController.protect, userController.deleteMe);

// -------------------------------------------------

router.patch(
   '/updatePassword/',
   authController.protect,
   authController.updatePassword
);

router
   .route('/')
   .get(userController.getAllUsers)
   .post(userController.createUser);
router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

module.exports = router;
