const { body } = require('express-validator');

const BRANDS = ['Toyota', 'Honda', 'Suzuki', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Nissan', 'VinFast', 'Khác'];

exports.vehicleValidator = [
    body('licensePlate')
    .trim().notEmpty().withMessage('Biển số xe không được để trống')
    .toUpperCase(),
    body('owner')
    .trim().notEmpty().withMessage('Tên chủ xe không được để trống'),
    body('phone')
    .trim().notEmpty().withMessage('Số điện thoại không được để trống')
    .matches(/^(0|\+84)[0-9]{8,10}$/).withMessage('Số điện thoại không hợp lệ'),
    body('brand')
    .optional().isIn(BRANDS).withMessage('Hãng xe không hợp lệ'),
    body('debt')
    .optional().isNumeric().withMessage('Tiền nợ phải là số')
    .isFloat({ min: 0 }).withMessage('Tiền nợ không được âm'),
];