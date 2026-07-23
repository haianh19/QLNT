require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./src/models/Vehicle');

// ---- DỮ LIỆU NGẪU NHIÊN ----
const BRANDS = ['Toyota', 'Honda', 'Suzuki', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Mitsubishi', 'Nissan', 'VinFast'];
const STATUSES = ['waiting', 'repairing', 'done'];
const STREETS = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Đinh Tiên Hoàng', 'Lý Thường Kiệt', 'Bà Triệu', 'Hai Bà Trưng', 'Hoàng Diệu', 'Phan Đình Phùng', 'Nguyễn Trãi'];
const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Huế', 'Nha Trang', 'Biên Hoà'];
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const TEN = ['Minh', 'Anh', 'Hùng', 'Long', 'Phúc', 'Tuấn', 'Nam', 'Dũng', 'Khoa', 'Hải', 'Linh', 'Lan', 'Hoa', 'Mai', 'Thu', 'Hà', 'Trang', 'Vy', 'Ngọc', 'Hằng'];
const DEM = ['Văn', 'Thị', 'Đức', 'Hữu', 'Quốc', 'Thanh', 'Xuân', 'Thành', 'Công', 'Bảo'];

// Tỉnh/thành biển số
const PLATES = [
    '29', '30', '31', '32', '33', '34', '43', '47', '48', '49',
    '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
    '61', '62', '63', '65', '66', '67', '68', '70', '71', '72',
    '74', '75', '76', '77', '78', '79', '80', '81', '82', '83',
    '84', '85', '86', '88', '89', '90', '92', '93', '94', '95',
    '97', '98', '99',
];

const LETTERS = 'ABCDEFGHKLMNPSTUVXY';

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randPhone() { return '0' + rand(['3', '5', '7', '8', '9']) + String(randInt(10000000, 99999999)); }

function randName() { return `${rand(HO)} ${rand(DEM)} ${rand(TEN)}`; }

function randAddress() { return `${randInt(1,200)} ${rand(STREETS)}, ${rand(CITIES)}`; }

function randDebt(status) {
    if (status === 'done') return 0;
    if (status === 'waiting') return Math.random() < 0.3 ? randInt(1, 10) * 50000 : 0;
    if (status === 'repairing') return randInt(1, 20) * 100000;
    return 0;
}

function randDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - randInt(0, daysAgo));
    return d;
}

function randPlate() {
    const prefix = rand(PLATES);
    const letter = rand(LETTERS.split(''));
    const num = String(randInt(10000, 99999));
    return `${prefix}${letter}-${num}`;
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');

        // Xoá dữ liệu cũ (tuỳ chọn)
        const existing = await Vehicle.countDocuments();
        console.log(`📊 Hiện có ${existing} xe trong DB`);

        const vehicles = [];
        const usedPlates = new Set();

        for (let i = 0; i < 500; i++) {
            // Tạo biển số không trùng
            let plate;
            do { plate = randPlate(); } while (usedPlates.has(plate));
            usedPlates.add(plate);

            const status = rand(STATUSES);

            vehicles.push({
                licensePlate: plate,
                owner: randName(),
                phone: randPhone(),
                address: randAddress(),
                brand: rand(BRANDS),
                status,
                debt: randDebt(status),
                createdAt: randDate(365),
            });
        }

        await Vehicle.insertMany(vehicles);
        console.log(`🎉 Đã thêm 500 xe vào MongoDB thành công!`);

        // Thống kê nhanh
        const stats = await Vehicle.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('\n📈 Thống kê:');
        stats.forEach(s => console.log(`   ${s._id}: ${s.count} xe`));

        const brandStats = await Vehicle.aggregate([
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        console.log('\n🚗 Theo hãng xe:');
        brandStats.forEach(s => console.log(`   ${s._id}: ${s.count} xe`));

    } catch (err) {
        console.error('❌ Lỗi:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Đã ngắt kết nối MongoDB');
    }
}

seed();