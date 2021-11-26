const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utilities/appError');
const busRouter = require('./routes/busRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use((req, res, next) => {
   console.log(req.headers);
   next();
});

// GLOBAL-MIDDLEWARES ---
// SET Security HTTP headers
app.use(helmet());

// Development Request logging
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
   max: 70,
   windowMs: 60000,
   message: 'Too many requests from this IP, Please try again in one minute!',
});

app.use('/api', limiter);

// Body Parser - reading data from the body into req.body
app.use(express.json({ limit: '10KB' }));

// Serving Static Files
app.use(express.static(`${__dirname}/public`));

// ROUTE HANDLERS ---
app.use('/api/v1/buses', busRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
   return next(
      new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
   );
});

app.use(globalErrorHandler);

module.exports = app;
