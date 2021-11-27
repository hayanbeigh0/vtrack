const express = require('express');
const busController = require('./../controllers/busController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', busController.checkId);

// ------------- WORK AROUND - REMOVING HTTP METHODS

// for auduino:
router.get('/updateBus-arduino/:id', busController.updateBusLocationArduino)

router.post(
   '/updateBus/:id',
   authController.protect,
   authController.restrictTo('admin'),
   busController.updateBus
);

router.get(
   '/deleteBus/:id',
   authController.protect,
   authController.restrictTo('admin')
);
// -------------------------------------------------

router
   .route('/')
   .get(authController.protect, busController.getAllBuses)
   .post(
      authController.protect,
      authController.restrictTo('admin'),
      busController.createBus
   );

router
   .route('/:id')
   .get(busController.getBus)
   .patch(
      authController.protect,
      authController.restrictTo('admin'),
      busController.updateBus
   )
   .delete(
      authController.protect,
      authController.restrictTo('admin'),
      busController.deleteBus
   );

module.exports = router;
