const router = require('express').Router();
const ctrl = require('../controllers/vehicleController');
const { vehicleValidator } = require('../validators/vehicleValidator');
const validate = require('../middleware/validate');



router.route('/')
    .get(ctrl.getVehicles)
    .post(vehicleValidator, validate, ctrl.createVehicle);

router.route('/:id')
    .get(ctrl.getVehicle)
    .put(ctrl.updateVehicle)
    .delete(ctrl.deleteVehicle);

module.exports = router;