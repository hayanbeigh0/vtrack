const AppError = require('../utilities/appError');

const handleCastErrorDB = (err) => {
   const message = `Invalid ${err.path}: ${err.value}`;
   return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
   const valStrArr = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/);

   let val;
   if (valStrArr) {
      val = valStrArr[0];
   } else {
      val = `{${err.errmsg.match(/{([^}]*)}/)['0'].split(' ')[1]}}`;
   }

   // const val = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
   const message = `Duplicate field value ${val}. Please use another value.`;

   return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
   const errors = Object.values(err.errors).map((cur) => cur.message);

   const message = `Invalid input data. ${errors.join('. ')}`;
   return new AppError(message, 400);
};

const handleJWTError = () =>
   new AppError('Invalid token! Please login again.', 401);

const handleJWTExpiredError = () => {
   return new AppError('Your token has expired. Please login again.', 401);
};

const sendErrorDev = (err, res) => {
   res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
   });

   console.log(err);
};

const sendErrorProd = (err, res) => {
   // Operational error: Send message to the client
   if (err.isOperational) {
      return res.status(err.statusCode).json({
         status: err.status,
         message: err.errmsg || err.message, // FIX IT: err.errmsg is not consistent: sometimes it works with errmsg and sometimes with .message
      });

      // Programming or other unknown error: Don't leak error details
   } else {
      // Log the error to the console
      console.error('Error ***: ', err);

      // Send generic error message in response
      return res.status(500).json({
         status: 'error',
         message: 'Something went very wrong',
      });
   }
};

const errorController = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';

   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, res);
   } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err };
      error.name = err.name;
      error.errmsg = err.message;

      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if (error.code * 1 === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError')
         error = handleValidationErrorDB(error);

      if (error.name === 'JsonWebTokenError') error = handleJWTError();
      if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

      sendErrorProd(error, res);
   }
};

module.exports = errorController;
