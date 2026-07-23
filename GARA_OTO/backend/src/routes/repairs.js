const router = require('express').Router();
const ctrl = require('../controllers/repairController');
const { repairValidator } = require('../validators/repairValidator');
const validate = require('../middleware/validate');


router.route('/')
    .get(ctrl.getRepairs)
    .post(repairValidator, validate, ctrl.createRepair);

router.route('/:id')
    .get(ctrl.getRepair)
    .put(ctrl.updateRepair)
    .delete(ctrl.deleteRepair);

module.exports = router;