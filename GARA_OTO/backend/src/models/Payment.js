const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vui lòng chọn xe'],
    },
    amount: {
        type: Number,
        required: [true, 'Số tiền không được để trống'],
        min: [1, 'Số tiền phải lớn hơn 0'],
    },
    paymentDate: { type: Date, default: Date.now },
    debtBefore: { type: Number }, // Tiền nợ trước khi thu
    debtAfter: { type: Number }, // Tiền nợ sau khi thu
    note: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);