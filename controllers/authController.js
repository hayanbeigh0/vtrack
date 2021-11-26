const { promisify } = require('util');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const sendEmail = require('../utilities/email');

const signToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECERET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};

const createSendToken = (user, statusCode, res) => {
   const token = signToken(user._id);

   user.password = undefined;
   user.active = undefined;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;

   const cookieOptions = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 7776000000
      ),
      httpOnly: true,
   };

   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

   res.cookie('jwt', token, cookieOptions);

   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user,
      },
   });
};

const signup = catchAsync(async (req, res, next) => {
   req.body.role = 'user';
   const newUser = await User.create(req.body);

   token = signToken(newUser._id);
   newUser.password = '**********';

   // res.status(200).json({
   //    status: 'success',
   //    token,
   //    data: {
   //       user: newUser,
   //    },
   // });

   createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   // 1. Check if the user and password exist
   if (!email || !password)
      return next(new AppError('Please provide your email and password.', 400));

   // 2. Check if the user exist and the password is correct
   const user = await User.findOne({ email }).select('+password');

   if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError('Invalid email or password.', 401));

   // 3. Send the token to the client
   const token = signToken(user._id);

   // res.status(200).json({
   //    status: 'success',
   //    token,
   // });

   createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
   // 1. Get the token and check if it exists
   let token;

   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1];
   }

   if (!token)
      return next(
         new AppError('You are not logged. Please login to get access.', 401)
      );

   // 2. Verify the token
   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECERET);

   // 3. Check if user still exists
   const curUser = await User.findById(decoded.id);

   if (!curUser)
      return next(
         new AppError('User belonging to this token does no longer exist.', 401)
      );

   // 4. Check if the user changed the password after the token was issued
   if (curUser.changedPasswordAfter(decoded.iat))
      return next(
         new AppError(
            'User has recently changed the password! Please login again.',
            401
         )
      );

   // 5. GRANT ACCESS TO THE ROUTE
   req.user = curUser;
   next();
});

const restrictTo = (...roles) => {
   // roles is an array:
   return (req, res, next) => {
      if (!roles.includes(req.user.role))
         return next(
            new AppError('You are not authorized to access this route!', 403)
         );

      next();
   };
};

const forgotPassword = catchAsync(async (req, res, next) => {
   // 1. Get the user
   const user = await User.findOne({ email: req.body.email });

   if (!user) return next(new AppError('No user found with that email!', 404));

   // 2. Create the random password reset token
   const token = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false });

   // 3. Send the token back to the user's email
   const resetURL = `${req.protocol}://${req.get(
      'host'
   )}/api/v1/users/resetPassword/${token}`;

   const message = `Forgot your password? Submit a PATCH request with your password and passwordConfirm on: ${resetURL}.\nIf you didn't forgot your password then please ignore this email.`;

   try {
      await sendEmail({
         email: user.email,
         subject: 'Your password reset token.',
         message,
      });
   } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
         new AppError(
            'Something went wrong while sending email! Please try again later.',
            500
         )
      );
   }

   // 4. Send a response to the user
   res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email.',
   });
});

const resetPassword = catchAsync(async (req, res, next) => {
   // 1. Get the user based on the passwordResetToken and passwordResetExpires
   const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   });

   if (!user)
      return next(new AppError('Token is invalid or has expired!', 400));

   // 2. Check if password and passwordConfirm are present in the request body
   if (!req.body.password || !req.body.passwordConfirm)
      return next(new AppError('Please provide your email and password!'));

   // 3. Set the password and passwordConfirm: use .save(); running all the validators before save
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();

   // 5. Update passwordChangedAt property: Happens automatically through the pre-save mongoose middleware

   // 4. Log the user in
   const token = signToken(user._id);

   // res.status(200).json({
   //    status: 'success',
   //    message: 'Password successfully updated',
   //    token,
   // });

   createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
   if (!req.body.password || !req.body.newPassword || !req.body.passwordConfirm)
      return next(
         new AppError(
            'Please provide your: password, newPassword, passwordConfirm'
         ),
         400
      );

   // 1. Get the user
   const user = await User.findById(req.user._id).select('+password');
   // const user = req.user;

   if (!(await user.correctPassword(req.body.password, user.password)))
      return next(new AppError('Invalid Password! Please try again.', 403));

   // 2. Set the new password
   user.password = req.body.newPassword;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save();

   // 3. Log the user in
   const token = signToken(user._id);

   // res.status(200).json({
   //    status: 'success',
   //    message: 'Password successfully updated',
   //    token,
   // });

   createSendToken(user, 200, res);
});

module.exports = {
   signup,
   login,
   protect,
   restrictTo,
   forgotPassword,
   resetPassword,
   updatePassword,
};
