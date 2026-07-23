const mongoose = require('mongoose');

const repairItemSchema = new mongoose.Schema({
    content: { type: String, required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    materialName: { type: String },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    total: { type: Number },
}, { _id: true });

// Tự tính total trước khi lưu
// For subdocuments (embedded items) use a synchronous pre hook
repairItemSchema.pre('save', function() {
    this.total = (this.qty * this.unitPrice) + this.laborCost;
});

const repairSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vui lòng chọn xe'],
    },
    repairDate: { type: Date, default: Date.now },
    items: [repairItemSchema],
    totalAmount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'cancelled'],
        default: 'in-progress',
    },
    note: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Tự tính totalAmount
// Compute totalAmount synchronously before saving the document
repairSchema.pre('save', function() {
    this.totalAmount = this.items.reduce((sum, item) => {
        item.total = (item.qty * item.unitPrice) + item.laborCost;
        return sum + item.total;
    }, 0);
});

module.exports = mongoose.model('Repair', repairSchema);