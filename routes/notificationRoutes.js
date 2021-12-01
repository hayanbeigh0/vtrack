const express = require('express');
const notificationControllere = require('../controllers/notificationController');
const authController = require('../controllers/authController')

const router = express.Router();

router.route('/')
    .get(notificationControllere.getAllNotifications)
    .post(authController.protect, authController.restrictTo('admin'), notificationControllere.createNotification);

module.exports = router;