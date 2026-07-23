const Material = require('../models/Material');
const Repair = require('../models/Repair');
const Payment = require('../models/Payment');

const getRelativeTime = (date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
};

exports.getNotifications = async(req, res) => {
    const [lowStockMaterials, payments, repairs] = await Promise.all([
        Material.find({ $expr: { $lt: ['$stock', '$minStock'] } })
        .sort({ stock: 1 })
        .limit(3),
        Payment.find()
        .populate('vehicle', 'licensePlate')
        .sort({ createdAt: -1 })
        .limit(3),
        Repair.find({ status: 'completed' })
        .populate('vehicle', 'licensePlate')
        .sort({ updatedAt: -1 })
        .limit(3),
    ]);

    const notifications = [];

    lowStockMaterials.forEach((material) => {
        notifications.push({
            id: `material-${material._id}`,
            icon: '⚠️',
            text: `Vật tư ${material.name} sắp hết (còn ${material.stock} ${material.unit})`,
            time: getRelativeTime(material.updatedAt || material.createdAt),
            type: 'warning',
            date: material.updatedAt || material.createdAt,
        });
    });

    payments.forEach((payment) => {
        notifications.push({
            id: `payment-${payment._id}`,
            icon: '💰',
            text: `Phiếu thu tiền ${payment.vehicle?.licensePlate || ''} ${payment.amount.toLocaleString()} đã được ghi nhận`,
            time: getRelativeTime(payment.paymentDate),
            type: 'success',
            date: payment.paymentDate,
        });
    });

    repairs.forEach((repair) => {
        notifications.push({
            id: `repair-${repair._id}`,
            icon: '🔧',
            text: `Phiếu sửa chữa ${repair.vehicle?.licensePlate || ''} đã hoàn thành`,
            time: getRelativeTime(repair.updatedAt || repair.repairDate),
            type: 'success',
            date: repair.updatedAt || repair.repairDate,
        });
    });

    const sorted = notifications
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    res.json({ success: true, total: sorted.length, data: sorted });
};