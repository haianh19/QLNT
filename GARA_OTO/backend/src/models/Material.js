const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên vật tư không được để trống'],
        trim: true,
    },
    unit: { type: String, required: true, default: 'Cái' },
    price: { type: Number, required: true, min: [0, 'Giá không được âm'] },
    stock: { type: Number, required: true, default: 0, min: 0 },
    minStock: { type: Number, default: 5, min: 0 },
    category: {
        type: String,
        enum: ['Dầu nhớt', 'Lọc', 'Phanh', 'Điện', 'Động cơ', 'Truyền động', 'Thân xe', 'Khác'],
        default: 'Khác',
    },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: isLowStock
materialSchema.virtual('isLowStock').get(function() {
    return this.stock < this.minStock;
});

module.exports = mongoose.model('Material', materialSchema);