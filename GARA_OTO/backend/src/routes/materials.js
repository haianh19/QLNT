const router = require('express').Router();
const ctrl = require('../controllers/materialController');



router.route('/').get(ctrl.getMaterials).post(ctrl.createMaterial);
router.route('/:id').get(ctrl.getMaterial).put(ctrl.updateMaterial).delete(ctrl.deleteMaterial);

module.exports = router;