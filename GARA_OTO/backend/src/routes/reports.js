const router = require('express').Router();
const ctrl = require('../controllers/reportController');



router.get('/dashboard', ctrl.getDashboardStats);
router.get('/revenue', ctrl.getRevenueReport);
router.get('/by-brand', ctrl.getRevenueByBrand);

module.exports = router;