const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
   routeNo: {
      type: Number,
      unique: true,
   },
   legalRegNo: {
      type: String,
      required: [true, 'Bus route must have a legal registration number'],
      unique: true,
   },
   maxCapacity: {
      type: Number,
      required: [true, 'Bus must have a max group size'],
   },
   driverName: {
      type: String,
      trim: true,
   },
   isRunning: {
      type: Boolean,
      default: false,
   },
   studentsOnBoard: {
      type: Number,
      default: 0,
   },
   currentLocationLat: {
      type: String,
   },
   currentLocationLng: {
      type: String,
   },
   toUniStartTime: {
      type: Date,
   },
   toHomeStartTime: {
      type: Date,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
