const Bus = require('../models/busModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

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
      currentLocation: req.query.coordinates,
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

module.exports = {
   getAllBuses,
   getBus,
   createBus,
   updateBus,
   deleteBus,
   updateBusLocationArduino
};
