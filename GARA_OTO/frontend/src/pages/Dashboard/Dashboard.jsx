import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import reportService   from '../../services/reportService';
import vehicleService  from '../../services/vehicleService';
import materialService from '../../services/materialService';
import {
  mockMonthlyRevenue, mockRevenueByBrand,   // ← fallback khi DB chưa có data
  formatCurrency, getStatusLabel, getStockStatus,
} from '../../data/mockData';
import './Dashboard.css';

// ---- CUSTOM TOOLTIP ----
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}:{' '}
          <strong>
            {entry.name === 'Doanh thu' ? formatCurrency(entry.value) : entry.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

const PIE_COLORS = ['#06B6D4','#3B82F6','#8B5CF6','#F59E0B','#10B981','#EF4444','#64748B'];

// ---- STAT CARD ----
function StatCard({ icon, label, value, sub, accent }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div className={`stat-card ${shown ? 'stat-card-visible' : ''}`} style={{ '--card-accent': accent }}>
      <div className="stat-card-header">
        <div className="stat-icon" style={{ background: `${accent}1a`, color: accent }}>{icon}</div>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      <div className="stat-glow" />
    </div>
  );
}

export default function Dashboard() {
  const [stats,     setStats]     = useState(null);
  const [revenue,   setRevenue]   = useState([]);
  const [byBrand,   setByBrand]   = useState([]);
  const [repairing, setRepairing] = useState([]);
  const [lowStock,  setLowStock]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, revRes, brandRes, repRes, matRes] = await Promise.all([
          reportService.getDashboard(),
          reportService.getRevenue(),
          reportService.getByBrand(),
          vehicleService.getAll({ status: 'repairing', limit: 5 }),
          materialService.getAll({ lowStock: true }),
        ]);

        setStats(dashRes.data || {});

        // Nếu DB chưa có data → dùng mock để demo
        setRevenue(revRes.data?.length > 0 ? revRes.data : mockMonthlyRevenue);
        setByBrand(brandRes.data?.length > 0 ? brandRes.data : mockRevenueByBrand);

        setRepairing(repRes.data || []);
        setLowStock(matRes.data || []);
      } catch (err) {
        console.error('Dashboard error:', err);
        // Fallback hoàn toàn sang mock data
        setRevenue(mockMonthlyRevenue);
        setByBrand(mockRevenueByBrand);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="page-wrapper dashboard-page">
      <div className="stats-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)', marginTop: 24 }} />
    </div>
  );

  // Chuẩn hoá revenue data cho chart (API trả về {month, revenue, repairs} hoặc mock)
  const chartData = revenue.map(r => ({
    month:   r.month   ?? `T${r._id?.month ?? '?'}`,
    revenue: r.revenue ?? 0,
    repairs: r.repairs ?? 0,
  }));

  // Chuẩn hoá brand data cho pie
  const brandData = byBrand.map(b => ({
    brand:   b.brand   ?? b._id ?? 'Khác',
    revenue: b.revenue ?? 0,
    repairs: b.repairs ?? 0,
    ratio:   b.ratio   ?? 0,
  }));

  return (
    <div className="page-wrapper dashboard-page">

      {/* WELCOME */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-title">
          Yo! Wassup, <span>Boss!</span> 👋
          </h1>
          <p>Đây là tổng quan hoạt động hôm nay của gara bạn.</p>
        </div>
        <div className="dashboard-live">
          <span className="live-dot" />
          <span>Đang hoạt động</span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <StatCard
          icon={<CarIcon />}
          label="Tổng số xe"
          value={stats?.totalVehicles ?? 0}
          sub="Xe đã đăng ký trong hệ thống"
          accent="#06B6D4"
        />
        <StatCard
          icon={<WrenchIcon />}
          label="Xe đang sửa"
          value={stats?.repairingNow ?? 0}
          sub="Đang trong xưởng"
          accent="#F59E0B"
        />
        <StatCard
          icon={<MoneyIcon />}
          label="Doanh thu tháng"
          value={formatCurrency(stats?.monthRevenue ?? 0)}
          sub="Tổng phiếu đã hoàn thành"
          accent="#10B981"
        />
        <StatCard
          icon={<BoxIcon />}
          label="Vật tư sắp hết"
          value={`${stats?.lowStockMaterials ?? 0} loại`}
          sub="Cần nhập thêm hàng"
          accent="#EF4444"
        />
      </div>

      {/* CHARTS */}
      <div className="dashboard-charts">

        {/* Area Chart — Doanh thu theo tháng */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3>Doanh thu theo tháng</h3>
              <p className="text-muted text-sm">Năm 2025 – 2026</p>
            </div>
            <div className="chart-legend">
              <span className="legend-dot" style={{ background: '#06B6D4' }} />
              <span>Doanh thu</span>
              <span className="legend-dot" style={{ background: '#8B5CF6' }} />
              <span>Lượt sửa</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRepairs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tickFormatter={v => `${(v / 1e6).toFixed(0)}M`}
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                yAxisId="right" orientation="right"
                tick={{ fill: '#64748B', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu"
                stroke="#06B6D4" strokeWidth={2} fill="url(#gradRevenue)"
                dot={false} activeDot={{ r: 4, fill: '#06B6D4' }}
              />
              <Area
                yAxisId="right" type="monotone" dataKey="repairs" name="Lượt sửa"
                stroke="#8B5CF6" strokeWidth={2} fill="url(#gradRepairs)"
                dot={false} activeDot={{ r: 4, fill: '#8B5CF6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Doanh thu theo hãng */}
        <div className="card chart-card chart-card-sm">
          <div className="chart-header">
            <div>
              <h3>Doanh thu theo hãng</h3>
              <p className="text-muted text-sm">Phân bổ tỷ lệ</p>
            </div>
          </div>
          <div className="pie-wrapper">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={brandData}
                  dataKey="revenue"
                  nameKey="brand"
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={3}
                >
                  {brandData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="pie-legend">
              {brandData.map((b, i) => (
                <li key={i}>
                  <span className="legend-dot" style={{ background: PIE_COLORS[i] }} />
                  <span>{b.brand}</span>
                  <span className="pie-pct">
                    {brandData.reduce((s, x) => s + x.revenue, 0) > 0
                      ? `${Math.round((b.revenue / brandData.reduce((s,x) => s+x.revenue,0)) * 100)}%`
                      : `${b.ratio ?? 0}%`
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM TABLES */}
      <div className="dashboard-tables">

        {/* Xe đang sửa */}
        <div className="card table-card">
          <div className="table-card-header">
            <div>
              <h3>Xe đang sửa chữa</h3>
              <p className="text-muted text-sm">{repairing.length} xe trong xưởng</p>
            </div>
            <a href="/vehicles" className="btn btn-ghost btn-sm">Xem tất cả</a>
          </div>
          <div className="table-scroll">
            {repairing.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <p>Không có xe nào đang sửa</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Biển số</th><th>Chủ xe</th>
                    <th>Hãng xe</th><th>Tiền nợ</th><th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {repairing.map(v => {
                    const status = getStatusLabel(v.status);
                    return (
                      <tr key={v._id}>
                        <td><span className="plate-badge">{v.licensePlate}</span></td>
                        <td>{v.owner}</td>
                        <td>{v.brand}</td>
                        <td><span className="money money-warning">{formatCurrency(v.debt)}</span></td>
                        <td><span className={`badge badge-${status.type} badge-dot`}>{status.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Vật tư sắp hết */}
        <div className="card table-card">
          <div className="table-card-header">
            <div>
              <h3>Vật tư sắp hết</h3>
              <p className="text-muted text-sm">{lowStock.length} mặt hàng cần nhập</p>
            </div>
            <a href="/materials" className="btn btn-ghost btn-sm">Xem kho</a>
          </div>
          <div className="table-scroll">
            {lowStock.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <p>Kho hàng đầy đủ 🎉</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên vật tư</th><th>Tồn kho</th>
                    <th>Tối thiểu</th><th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(m => {
                    const s = getStockStatus(m);
                    return (
                      <tr key={m._id}>
                        <td>{m.name}</td>
                        <td>
                          <span className="font-mono" style={{ color: m.stock === 0 ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
                            {m.stock} {m.unit}
                          </span>
                        </td>
                        <td><span className="text-muted">{m.minStock} {m.unit}</span></td>
                        <td><span className={`badge badge-${s.type} badge-dot`}>{s.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ---- ICONS ----
function CarIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>; }
function WrenchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>; }
function MoneyIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function BoxIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }