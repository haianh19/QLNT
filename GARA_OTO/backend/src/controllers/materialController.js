const Material = require('../models/Material');

exports.getMaterials = async(req, res) => {
    const { search, category, lowStock } = req.query;
    const query = {};
    if (search) query.name = new RegExp(search, 'i');
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lt: ['$stock', '$minStock'] };

    const materials = await Material.find(query).sort({ createdAt: -1 });
    res.json({ success: true, total: materials.length, data: materials });
};

exports.getMaterial = async(req, res) => {
    const m = await Material.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy vật tư' });
    res.json({ success: true, data: m });
};

exports.createMaterial = async(req, res) => {
    const m = await Material.create(req.body);
    res.status(201).json({ success: true, message: 'Thêm vật tư thành công', data: m });
};

exports.updateMaterial = async(req, res) => {
    const m = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy vật tư' });
    res.json({ success: true, message: 'Cập nhật vật tư thành công', data: m });
};

exports.deleteMaterial = async(req, res) => {
    const m = await Material.findByIdAndDelete(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy vật tư' });
    res.json({ success: true, message: 'Xoá vật tư thành công' });
};