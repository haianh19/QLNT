const { body } = require('express-validator');

exports.registerValidator = [
    body('name').trim().notEmpty().withMessage('Tên không được để trống'),
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('role').optional().isIn(['admin', 'staff']).withMessage('Role không hợp lệ'),
];

exports.loginValidator = [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];