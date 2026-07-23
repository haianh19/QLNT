const Repair = require('../models/Repair');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');

// @route GET /api/reports/revenue?month=5&year=2026
exports.getRevenueReport = async(req, res) => {
    const { year = new Date().getFullYear() } = req.query;

    const data = await Repair.aggregate([
        { $match: { status: 'completed', repairDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
        {
            $group: {
                _id: { month: { $month: '$repairDate' } },
                revenue: { $sum: '$totalAmount' },
                repairs: { $sum: 1 },
            }
        },
        { $sort: { '_id.month': 1 } },
        { $project: { month: '$_id.month', revenue: 1, repairs: 1, _id: 0 } },
    ]);

    res.json({ success: true, year: Number(year), data });
};

// @route GET /api/reports/by-brand?month=5&year=2026
exports.getRevenueByBrand = async(req, res) => {
    const { year = new Date().getFullYear(), month } = req.query;
    const start = month ? new Date(`${year}-${month}-01`) : new Date(`${year}-01-01`);
    const end = month ? new Date(`${year}-${month}-31`) : new Date(`${year}-12-31`);

    const data = await Repair.aggregate([
        { $match: { status: 'completed', repairDate: { $gte: start, $lte: end } } },
        { $lookup: { from: 'vehicles', localField: 'vehicle', foreignField: '_id', as: 'vehicleInfo' } },
        { $unwind: '$vehicleInfo' },
        {
            $group: {
                _id: '$vehicleInfo.brand',
                revenue: { $sum: '$totalAmount' },
                repairs: { $sum: 1 },
            }
        },
        { $sort: { revenue: -1 } },
        { $project: { brand: '$_id', revenue: 1, repairs: 1, _id: 0 } },
    ]);

    res.json({ success: true, data });
};

// @route GET /api/reports/dashboard
exports.getDashboardStats = async(req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalVehicles, repairingNow, monthRevenue, lowStockCount] = await Promise.all([
        Vehicle.countDocuments(),
        Vehicle.countDocuments({ status: 'repairing' }),
        Repair.aggregate([
            { $match: { status: 'completed', repairDate: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        require('../models/Material').countDocuments({ $expr: { $lt: ['$stock', '$minStock'] } }),
    ]);

    res.json({
        success: true,
        data: {
            totalVehicles,
            repairingNow,
            monthRevenue: monthRevenue[0]?.total || 0,
            lowStockMaterials: lowStockCount,
        },
    });
};