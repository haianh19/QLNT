// ================================================
// MOCK DATA — Garage Management System
// ================================================

export const VEHICLE_BRANDS = [
    'Toyota', 'Honda', 'Suzuki', 'Ford', 'Hyundai',
    'Kia', 'Mazda', 'Mitsubishi', 'Nissan', 'VinFast',
];

export const mockVehicles = [
    { id: 1, licensePlate: '88H-7777', owner: 'Trần Đức Minh', phone: '0912345678', address: '98 Hàn Thuyên, Q.1', brand: 'Suzuki', debt: 580000, status: 'repairing', createdAt: '2026-04-22' },
    { id: 2, licensePlate: '51A-12345', owner: 'Nguyễn Văn An', phone: '0987654321', address: '45 Lê Lợi, Q.3', brand: 'Toyota', debt: 0, status: 'done', createdAt: '2026-04-18' },
    { id: 3, licensePlate: '29B-99881', owner: 'Lê Thị Bích', phone: '0905111222', address: '12 Bà Triệu, HN', brand: 'Honda', debt: 1200000, status: 'repairing', createdAt: '2026-04-20' },
    { id: 4, licensePlate: '43C-55612', owner: 'Phạm Hoàng Nam', phone: '0933221100', address: '77 Đinh Tiên Hoàng, HN', brand: 'Ford', debt: 3500000, status: 'waiting', createdAt: '2026-05-01' },
    { id: 5, licensePlate: '51F-88900', owner: 'Vũ Thị Lan', phone: '0977888999', address: '33 Nguyễn Huệ, Q.1', brand: 'Hyundai', debt: 0, status: 'done', createdAt: '2026-05-03' },
    { id: 6, licensePlate: '30A-11234', owner: 'Hoàng Minh Tuấn', phone: '0915663377', address: '88 Trần Phú, HN', brand: 'Mazda', debt: 2100000, status: 'repairing', createdAt: '2026-05-05' },
    { id: 7, licensePlate: '60B-77441', owner: 'Đặng Thu Hà', phone: '0966443322', address: '21 Lý Thường Kiệt', brand: 'Kia', debt: 450000, status: 'waiting', createdAt: '2026-05-08' },
    { id: 8, licensePlate: '51H-33218', owner: 'Bùi Quang Khải', phone: '0901234567', address: '55 Phan Đình Phùng', brand: 'Mitsubishi', debt: 0, status: 'done', createdAt: '2026-05-10' },
];

export const mockMaterials = [
    { id: 1, name: 'Nhớt Castrol 5W-30', unit: 'Lít', price: 85000, stock: 45, minStock: 10, category: 'Dầu nhớt' },
    { id: 2, name: 'Lọc dầu Toyota', unit: 'Cái', price: 120000, stock: 8, minStock: 15, category: 'Lọc' },
    { id: 3, name: 'Lọc gió Honda', unit: 'Cái', price: 95000, stock: 3, minStock: 10, category: 'Lọc' },
    { id: 4, name: 'Má phanh trước Suzuki', unit: 'Bộ', price: 280000, stock: 12, minStock: 5, category: 'Phanh' },
    { id: 5, name: 'Bugi NGK', unit: 'Cái', price: 65000, stock: 30, minStock: 20, category: 'Điện' },
    { id: 6, name: 'Dây curoa Mitsuboshi', unit: 'Sợi', price: 180000, stock: 2, minStock: 8, category: 'Động cơ' },
    { id: 7, name: 'Dầu phanh Bosch', unit: 'Chai', price: 75000, stock: 18, minStock: 10, category: 'Dầu nhớt' },
    { id: 8, name: 'Bạc đạn bánh xe', unit: 'Cái', price: 350000, stock: 6, minStock: 5, category: 'Truyền động' },
    { id: 9, name: 'Lọc nhiên liệu Ford', unit: 'Cái', price: 145000, stock: 4, minStock: 8, category: 'Lọc' },
    { id: 10, name: 'Cao su cản sau', unit: 'Bộ', price: 220000, stock: 20, minStock: 5, category: 'Thân xe' },
];

export const LABOR_OPTIONS = [
    { id: 1, name: 'Thay nhớt', price: 50000 },
    { id: 2, name: 'Thay lọc gió', price: 30000 },
    { id: 3, name: 'Thay má phanh', price: 120000 },
    { id: 4, name: 'Sửa điện', price: 200000 },
    { id: 5, name: 'Bảo dưỡng định kỳ', price: 150000 },
    { id: 6, name: 'Thay bugi', price: 40000 },
    { id: 7, name: 'Căn chỉnh góc lái', price: 180000 },
    { id: 8, name: 'Thay lọc nhiên liệu', price: 45000 },
];

export const mockRepairs = [{
        id: 1,
        vehicleId: 1,
        licensePlate: '88H-7777',
        ownerName: 'Trần Đức Minh',
        date: '2026-04-22',
        status: 'completed',
        items: [
            { id: 1, content: 'Thay nhớt', materialId: 1, materialName: 'Nhớt Castrol 5W-30', qty: 3, unitPrice: 85000, laborCost: 50000, total: 305000 },
            { id: 2, content: 'Thay lọc gió', materialId: 3, materialName: 'Lọc gió Honda', qty: 1, unitPrice: 95000, laborCost: 30000, total: 125000 },
        ],
        totalAmount: 430000,
        note: '',
    },
    {
        id: 2,
        vehicleId: 3,
        licensePlate: '29B-99881',
        ownerName: 'Lê Thị Bích',
        date: '2026-04-20',
        status: 'in-progress',
        items: [
            { id: 1, content: 'Thay má phanh', materialId: 4, materialName: 'Má phanh trước Suzuki', qty: 1, unitPrice: 280000, laborCost: 120000, total: 400000 },
        ],
        totalAmount: 400000,
        note: 'Kiểm tra thêm dầu phanh',
    },
];

export const mockPayments = [
    { id: 1, vehicleId: 1, licensePlate: '88H-7777', ownerName: 'Trần Đức Minh', phone: '0912345678', date: '2026-04-22', amount: 430000, debt: 580000, note: '' },
    { id: 2, vehicleId: 2, licensePlate: '51A-12345', ownerName: 'Nguyễn Văn An', phone: '0987654321', date: '2026-04-18', amount: 850000, debt: 0, note: '' },
];

// Revenue by month
export const mockMonthlyRevenue = [
    { month: 'T1', revenue: 12500000, repairs: 28 },
    { month: 'T2', revenue: 9800000, repairs: 22 },
    { month: 'T3', revenue: 15200000, repairs: 35 },
    { month: 'T4', revenue: 18900000, repairs: 43 },
    { month: 'T5', revenue: 14300000, repairs: 32 },
    { month: 'T6', revenue: 21500000, repairs: 48 },
    { month: 'T7', revenue: 19800000, repairs: 44 },
    { month: 'T8', revenue: 23100000, repairs: 52 },
    { month: 'T9', revenue: 16700000, repairs: 38 },
    { month: 'T10', revenue: 20400000, repairs: 46 },
    { month: 'T11', revenue: 22800000, repairs: 50 },
    { month: 'T12', revenue: 28500000, repairs: 61 },
];

// Revenue by brand
export const mockRevenueByBrand = [
    { brand: 'Toyota', revenue: 52400000, repairs: 48, ratio: 28 },
    { brand: 'Honda', revenue: 38200000, repairs: 35, ratio: 20 },
    { brand: 'Suzuki', revenue: 29800000, repairs: 28, ratio: 16 },
    { brand: 'Ford', revenue: 24500000, repairs: 22, ratio: 13 },
    { brand: 'Hyundai', revenue: 18700000, repairs: 17, ratio: 10 },
    { brand: 'Mazda', revenue: 14300000, repairs: 13, ratio: 8 },
    { brand: 'Khác', revenue: 9200000, repairs: 8, ratio: 5 },
];

export const DASHBOARD_STATS = {
    totalVehicles: 187,
    repairingNow: 12,
    monthRevenue: 28500000,
    lowStockMaterials: 4,
    completedThisMonth: 61,
    newVehiclesThisMonth: 23,
};

export function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatNumber(n) {
    return new Intl.NumberFormat('vi-VN').format(n);
}

export function getStatusLabel(status) {
    const map = {
        repairing: { label: 'Đang sửa', type: 'warning' },
        waiting: { label: 'Chờ sửa', type: 'info' },
        done: { label: 'Hoàn thành', type: 'success' },
        'in-progress': { label: 'Đang thực hiện', type: 'warning' },
        completed: { label: 'Hoàn thành', type: 'success' },
        cancelled: { label: 'Huỷ', type: 'danger' },
    };
    return map[status] || { label: status, type: 'default' };
}

export function getStockStatus(item) {
    if (item.stock <= 0) return { label: 'Hết hàng', type: 'danger' };
    if (item.stock < item.minStock) return { label: 'Sắp hết', type: 'warning' };
    return { label: 'Còn hàng', type: 'success' };
}