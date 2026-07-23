const Repair = require('../models/Repair');
const Vehicle = require('../models/Vehicle');
const Material = require('../models/Material');
const mongoose = require('mongoose');

exports.getRepairs = async(req, res) => {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const repairs = await Repair.find(query)
        .populate('vehicle', 'licensePlate owner phone brand')
        .populate('items.material', 'name unit')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Repair.countDocuments(query);
    res.json({ success: true, total, data: repairs });
};

exports.getRepair = async(req, res) => {
    const repair = await Repair.findById(req.params.id)
        .populate('vehicle', 'licensePlate owner phone brand debt')
        .populate('items.material', 'name unit price');
    if (!repair) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
    res.json({ success: true, data: repair });
};

exports.createRepair = async(req, res) => {
    const repair = await Repair.create(req.body); // bỏ createdBy

    // ✅ dùng req.body.vehicle thay vì req.body.vehicleId
    await Vehicle.findByIdAndUpdate(req.body.vehicle, {
        $inc: { debt: repair.totalAmount },
        status: 'repairing',
    });

    const populated = await repair.populate('vehicle', 'licensePlate owner');
    res.status(201).json({ success: true, message: 'Tạo phiếu sửa chữa thành công', data: populated });
};

exports.updateRepair = async(req, res) => {
    const session = await mongoose.startSession();
    try {
        let updatedRepair = null;

        const runInTransaction = async() => {
            const existing = await Repair.findById(req.params.id).session(session);
            if (!existing) {
                const err = new Error('Không tìm thấy phiếu');
                err.statusCode = 404;
                throw err;
            }

            const oldStatus = existing.status;

            // Apply update payload onto the document (keeps schema hooks working)
            existing.set(req.body);
            updatedRepair = await existing.save({ session, runValidators: true });

            const newStatus = updatedRepair.status;
            const transitionedToCompleted = oldStatus !== 'completed' && newStatus === 'completed';

            if (transitionedToCompleted) {
                // Aggregate material quantities across items
                const needByMaterialId = new Map();
                for (const item of (updatedRepair.items || [])) {
                    if (!item.material) continue;
                    const id = String(item.material);
                    const qty = Math.max(0, Number(item.qty) || 0);
                    if (qty <= 0) continue;
                    needByMaterialId.set(id, (needByMaterialId.get(id) || 0) + qty);
                }

                const materialIds = [...needByMaterialId.keys()];
                if (materialIds.length) {
                    const mats = await Material.find({ _id: { $in: materialIds } }).session(session);
                    const byId = new Map(mats.map(m => [String(m._id), m]));

                    for (const id of materialIds) {
                        const m = byId.get(id);
                        if (!m) {
                            const err = new Error('Có vật tư không tồn tại trong kho');
                            err.statusCode = 400;
                            throw err;
                        }
                        const need = needByMaterialId.get(id);
                        if (m.stock < need) {
                            const err = new Error(`Không đủ tồn kho cho vật tư "${m.name}" (cần ${need}, còn ${m.stock})`);
                            err.statusCode = 400;
                            throw err;
                        }
                    }

                    const ops = materialIds.map(id => ({
                        updateOne: {
                            filter: { _id: id },
                            update: { $inc: { stock: -needByMaterialId.get(id) } },
                        },
                    }));
                    await Material.bulkWrite(ops, { session });
                }

                // Update vehicle status when repair completed
                await Vehicle.findByIdAndUpdate(updatedRepair.vehicle, { status: 'done' }, { session });
            }
        };

        try {
            await session.withTransaction(runInTransaction);
        } catch (err) {
            // Fallback for standalone MongoDB that doesn't support transactions.
            const msg = String(err && err.message ? err.message : err);
            const isTxnUnsupported =
                msg.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
                msg.includes('Transaction') && msg.includes('replica set');

            if (!isTxnUnsupported) throw err;

            // ---- Non-transactional fallback with best-effort rollback ----
            const existing = await Repair.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
            const oldStatus = existing.status;

            existing.set(req.body);
            updatedRepair = await existing.save({ runValidators: true });

            const newStatus = updatedRepair.status;
            const transitionedToCompleted = oldStatus !== 'completed' && newStatus === 'completed';

            if (transitionedToCompleted) {
                const needByMaterialId = new Map();
                for (const item of (updatedRepair.items || [])) {
                    if (!item.material) continue;
                    const id = String(item.material);
                    const qty = Math.max(0, Number(item.qty) || 0);
                    if (qty <= 0) continue;
                    needByMaterialId.set(id, (needByMaterialId.get(id) || 0) + qty);
                }

                const materialIds = [...needByMaterialId.keys()];
                const deducted = [];
                try {
                    for (const id of materialIds) {
                        const need = needByMaterialId.get(id);
                        const m = await Material.findOneAndUpdate(
                            { _id: id, stock: { $gte: need } },
                            { $inc: { stock: -need } },
                            { new: true }
                        );
                        if (!m) {
                            // Fetch name/stock if possible for a nicer error message
                            const cur = await Material.findById(id);
                            const name = cur?.name || 'vật tư';
                            const stock = cur?.stock ?? 0;
                            const e = new Error(`Không đủ tồn kho cho vật tư "${name}" (cần ${need}, còn ${stock})`);
                            e.statusCode = 400;
                            throw e;
                        }
                        deducted.push({ id, qty: need });
                    }

                    await Vehicle.findByIdAndUpdate(updatedRepair.vehicle, { status: 'done' });
                } catch (e) {
                    // Rollback any already deducted stock
                    for (const d of deducted) {
                        await Material.findByIdAndUpdate(d.id, { $inc: { stock: d.qty } });
                    }
                    throw e;
                }
            }
        }

        res.json({ success: true, message: 'Cập nhật phiếu thành công', data: updatedRepair });
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json({ success: false, message: err.message || 'Cập nhật thất bại' });
    } finally {
        session.endSession();
    }
};

exports.deleteRepair = async(req, res) => {
    const repair = await Repair.findByIdAndDelete(req.params.id);
    if (!repair) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu' });
    res.json({ success: true, message: 'Xoá phiếu thành công' });
};