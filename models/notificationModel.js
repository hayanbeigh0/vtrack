const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    notificationTitle: {
        type: String,
        required: [true, 'Please enter the notificationTitle']
    },
    notificationMessage: {
        type: String,
        required: [true, 'Please enter the notificationMessage']
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;