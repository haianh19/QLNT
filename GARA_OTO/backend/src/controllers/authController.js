const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Tạo token
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// @route  POST /api/auth/register
exports.register = async(req, res) => {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);

    res.status(201).json({ success: true, message: 'Đăng ký thành công', token, data: user });
};

// @route  POST /api/auth/login
exports.login = async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }
    if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Tài khoản đã bị vô hiệu hoá' });
    }

    const token = signToken(user._id);
    res.json({ success: true, message: 'Đăng nhập thành công', token, data: user });
};

// @route  GET /api/auth/me
exports.getMe = async(req, res) => {
    res.json({ success: true, data: req.user });
};

// @route  PUT /api/auth/change-password
exports.changePassword = async(req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(oldPassword))) {
        return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
};