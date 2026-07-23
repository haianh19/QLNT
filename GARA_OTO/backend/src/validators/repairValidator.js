const { body } = require('express-validator');

exports.repairValidator = [
    body('vehicle')
    .notEmpty().withMessage('Vui lòng chọn xe')
    .isMongoId().withMessage('ID xe không hợp lệ'),

    body('items')
    .isArray({ min: 1 }).withMessage('Phiếu phải có ít nhất 1 hạng mục'),

    body('items.*.qty')
    .isInt({ min: 1 }).withMessage('Số lượng phải >= 1'),

    body('items.*.unitPrice')
    .isFloat({ min: 0 }).withMessage('Đơn giá không được âm'),

    // ✅ Bỏ validator content vì có thể để trống
    // body('items.*.content')... ← xoá dòng này
];