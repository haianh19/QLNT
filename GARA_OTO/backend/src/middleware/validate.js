const { validationResult } = require('express-validator');

// Middleware kiểm tra kết quả validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

module.exports = validate;