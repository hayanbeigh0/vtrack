const mongoose = require('mongoose');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

const filterObj = (obj, ...allowedFields) => {
   const newObj = {};

   Object.keys(obj).forEach((cur) => {
      if (allowedFields.includes(cur)) newObj[cur] = obj[cur];
   });

   return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
   const users = await User.find();

   res.status(200).json({
      status: 'success',
      data: {
         users,
      },
   });
});

const createUser = (req, res, next) => {
   res.status(500).json({
      status: 'fail',
      message: 'This route is not yet implemented!',
   });
};

const getUser = (req, res, next) => {
   res.status(500).json({
      status: 'fail',
      message: 'This route is not yet implemented!',
   });
};

const updateUser = (req, res, next) => {
   res.status(500).json({
      status: 'fail',
      message: 'This route is not yet implemented!',
   });
};

const deleteUser = (req, res, next) => {
   res.status(500).json({
      status: 'fail',
      message: 'This route is not yet implemented!',
   });
};

const getProfile = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.user._id);

   res.status(200).json({
      status: 'success',
      data: {
         user,
      },
   });
});

const updateMe = catchAsync(async (req, res, next) => {
   // 1. Create error if user POSTs password data
   if (req.body.password || req.body.passwordConfirm)
      return next(
         new AppError(
            'This route is not for password updates. Please use /updatePassword instead',
            400
         )
      );

   // 2. Update user document
   const filteredBody = filterObj(req.body, 'name', 'busStopLng', 'busStopLat', 'phoneNumber');

   const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      validateBeforeSave: true,
   });

   res.status(200).json({
      status: 'success',
      data: {
         user,
      },
   });
});

const deleteMe = catchAsync(async (req, res, next) => {
   const user = await User.findByIdAndUpdate(req.user._id, {
      active: false,
   });

   res.status(204).json({
      status: 'success',
      data: null,
   });
});

module.exports = {
   getAllUsers,
   createUser,
   getUser,
   updateUser,
   deleteUser,
   getProfile,
   updateMe,
   deleteMe,
};
