const Bus = require('../models/busModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const User = require('../models/userModel');

const getAllBuses = catchAsync(async (req, res, next) => {
   const buses = await Bus.find();

   res.status(200).json({
      status: 'success',
      results: buses.length,
      data: {
         buses,
      },
   });
});

const createBus = catchAsync(async (req, res, next) => {
   const bus = await Bus.create(req.body);

   res.status(201).json({
      status: 'success',
      message: 'Bus route successfully created!',
      bus,
   });
});

const getBus = catchAsync(async (req, res, next) => {
   const bus = await Bus.findById(req.params.id);

   if (!bus) return next(new AppError('No bus found with that id.', 404));

   res.status(200).json({
      status: 'success',
      data: {
         bus,
      },
   });
});

const updateBusLocationArduino = catchAsync(async (req, res, next) => {
   const bus = await Bus.findByIdAndUpdate(req.params.id, {
      currentLocationLat: req.query.lat,
      currentLocationLng: req.query.lng
   }, {
      new: true, 
      runValidators: true
   })

   if (!bus) return next(new AppError('No bus found with that id.', 404));

   res.status(200).json({
      status: 'success',
      data: {
         bus,
      },
   });
})

const updateBus = catchAsync(async (req, res, next) => {
   const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

   if (!bus) return next(new AppError('No bus found with that id.', 404));

   res.status(200).json({
      status: 'success',
      data: {
         bus,
      },
   });
});

const deleteBus = catchAsync(async (req, res, next) => {
   const bus = await Bus.findByIdAndDelete(req.params.id);

   if (!bus) return next(new AppError('No bus found with that id.', 404));

   res.status(500).json({
      status: 'fail',
      message: 'This route is not yet implemented!',
   });
});

const getBoardedCount = catchAsync(async (req, res, next) => {
   const routeNo = req.user.myRoute;
   const studentBoardedCount = await User.find({isBoarded: true, myRoute: routeNo});

   res.status(200).json({
      status: 'success',
      data: {
         studentsBoarded: studentBoardedCount.length,
         studentBoardedStr: `${studentBoardedCount.length}`
      }
   })
})

module.exports = {
   getAllBuses,
   getBus,
   createBus,
   updateBus,
   deleteBus,
   updateBusLocationArduino,
   getBoardedCount
};
