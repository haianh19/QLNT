const router = require('express').Router();
const ctrl = require('../controllers/notificationController');

router.get('/', ctrl.getNotifications);

module.exports = router;