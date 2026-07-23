const router = require('express').Router();
const ctrl = require('../controllers/paymentController');


router.route('/').get(ctrl.getPayments).post(ctrl.createPayment);

module.exports = router;