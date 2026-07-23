const Vehicle = require('../models/Vehicle');

// @route  GET /api/vehicles
exports.getVehicles = async(req, res) => {
    const { search, brand, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) query.$or = [
        { licensePlate: new RegExp(search, 'i') },
        { owner: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
    ];
    if (brand) query.brand = brand;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.json({ success: true, total, page: Number(page), totalPages: Math.ceil(total / limit), data: vehicles });
};

// @route  GET /api/vehicles/:id
exports.getVehicle = async(req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    res.json({ success: true, data: vehicle });
};

// @route  POST /api/vehicles
exports.createVehicle = async(req, res) => {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Thêm xe thành công', data: vehicle });
};

// @route  PUT /api/vehicles/:id
exports.updateVehicle = async(req, res) => {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    res.json({ success: true, message: 'Cập nhật xe thành công', data: vehicle });
};

// @route  DELETE /api/vehicles/:id
exports.deleteVehicle = async(req, res) => {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    res.json({ success: true, message: 'Xoá xe thành công' });
};