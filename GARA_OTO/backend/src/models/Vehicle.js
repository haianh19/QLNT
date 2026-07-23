const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    licensePlate: {
        type: String,
        required: [true, 'Biển số xe không được để trống'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    owner: {
        type: String,
        required: [true, 'Tên chủ xe không được để trống'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại không được để trống'],
        trim: true,
    },
    address: { type: String, trim: true, default: '' },
    brand: {
        type: String,
        enum: ['Toyota', 'Honda', 'Suzuki', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Nissan', 'VinFast', 'Khác'],
        default: 'Khác',
    },
    debt: { type: Number, default: 0, min: 0 },
    status: {
        type: String,
        enum: ['waiting', 'repairing', 'done'],
        default: 'waiting',
    },
    note: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index tìm kiếm nhanh
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ owner: 'text', licensePlate: 'text' });

module.exports = mongoose.model('Vehicle', vehicleSchema);