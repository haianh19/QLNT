const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');

exports.getPayments = async(req, res) => {
    const payments = await Payment.find()
        .populate('vehicle', 'licensePlate owner phone')
        .sort({ createdAt: -1 });
    res.json({ success: true, total: payments.length, data: payments });
};

exports.createPayment = async(req, res) => {
    const { vehicle: vehicleId, amount, note } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }
    if (amount > vehicle.debt) {
        return res.status(400).json({
            success: false,
            message: `Số tiền thu vượt quá tiền nợ (${vehicle.debt})`,
        });
    }

    const debtBefore = vehicle.debt;
    const debtAfter = debtBefore - amount;

    const payment = await Payment.create({
        vehicle: vehicleId,
        amount,
        note,
        debtBefore,
        debtAfter,
        // ✅ Xoá dòng: createdBy: req.user._id
    });

    // Trừ tiền nợ xe
    await Vehicle.findByIdAndUpdate(vehicleId, { debt: debtAfter });

    const populated = await payment.populate('vehicle', 'licensePlate owner phone');
    res.status(201).json({
        success: true,
        message: 'Thu tiền thành công',
        data: populated,
    });
};