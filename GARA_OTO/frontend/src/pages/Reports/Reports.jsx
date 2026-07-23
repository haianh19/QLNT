import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import reportService  from '../../services/reportService';
import vehicleService from '../../services/vehicleService';
import repairService  from '../../services/repairService';
import { formatCurrency } from '../../data/mockData';

const PIE_COLORS = ['#06B6D4','#3B82F6','#8B5CF6','#F59E0B','#10B981','#EF4444','#64748B'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-modal)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.8125rem',
    }}>
      <p style={{ color:'var(--text-muted)', fontWeight:600, marginBottom:4,
        fontFamily:'var(--font-mono)', fontSize:'0.6875rem', textTransform:'uppercase' }}>
        {label}
      </p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color, margin: '2px 0' }}>
          {e.name}:{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {e.name === 'Doanh thu' ? formatCurrency(e.value) : e.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

// Skeleton loader
function SkeletonCard() {
  return <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />;
}

export default function Reports() {
  const [tab,        setTab]        = useState('revenue');
  const [loading,    setLoading]    = useState(true);
  const [year,       setYear]       = useState(new Date().getFullYear());

  // Data states
  const [dashStats,  setDashStats]  = useState(null);
  const [revenue,    setRevenue]    = useState([]);
  const [byBrand,    setByBrand]    = useState([]);
  const [allRepairs, setAllRepairs] = useState([]);
  const [allVehicles,setAllVehicles]= useState([]);

  useEffect(() => {
    loadAll();
  }, [year]); // eslint-disable-line

  const loadAll = async () => {
    try {
      setLoading(true);
      const [dashRes, revRes, brandRes, repRes, vehRes] = await Promise.all([
        reportService.getDashboard(),
        reportService.getRevenue({ year }),
        reportService.getByBrand({ year }),
        repairService.getAll({ limit: 1000 }),
        vehicleService.getAll({ limit: 1000 }),
      ]);

      setDashStats(dashRes.data   || {});
      setRevenue(revRes.data      || []);
      setByBrand(brandRes.data    || []);
      setAllRepairs(repRes.data   || []);
      setAllVehicles(vehRes.data  || []);
    } catch (err) {
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Tính toán từ data thật ----
  const totalRevenue  = revenue.reduce((s, m) => s + (m.revenue || 0), 0);
  const totalRepairs  = revenue.reduce((s, m) => s + (m.repairs || 0), 0);
  const avgRevenue    = revenue.length > 0 ? totalRevenue / revenue.length : 0;
  const bestMonth     = revenue.reduce((best, m) => m.revenue > (best.revenue || 0) ? m : best, {});

  // Chart data — đảm bảo label tháng đúng
  const chartData = revenue.map(r => ({
    month:   `T${r.month ?? r._id?.month ?? '?'}`,
    revenue: r.revenue ?? 0,
    repairs: r.repairs ?? 0,
  }));

  // Brand data
  const brandData = byBrand.map(b => ({
    brand:   b.brand   ?? b._id ?? 'Khác',
    revenue: b.revenue ?? 0,
    repairs: b.repairs ?? 0,
  }));
  const totalBrandRevenue = brandData.reduce((s, b) => s + b.revenue, 0);

  // Thống kê xe theo hãng từ vehicles
  const vehicleByBrand = allVehicles.reduce((acc, v) => {
    acc[v.brand] = (acc[v.brand] || 0) + 1;
    return acc;
  }, {});
  const vehicleBrandData = Object.entries(vehicleByBrand)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count);

  // Thống kê phiếu theo trạng thái
  const repairByStatus = allRepairs.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = [
    { name: 'Đang thực hiện', value: repairByStatus['in-progress'] || 0, color: '#F59E0B' },
    { name: 'Hoàn thành',     value: repairByStatus['completed']   || 0, color: '#10B981' },
    { name: 'Đã huỷ',         value: repairByStatus['cancelled']   || 0, color: '#EF4444' },
  ].filter(s => s.value > 0);

  return (
    <div className="page-wrapper">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Báo cáo thống kê</h1>
          <p>Tổng hợp doanh thu và hoạt động</p>
        </div>
        {/* Chọn năm */}
        <select
          className="input-field"
          style={{ width: 120 }}
          value={year}
          onChange={e => setYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>
      </div>

      {/* SUMMARY CARDS */}
      {loading ? (
        <div className="stats-grid">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="stats-grid">
          {[
            {
              label: 'Tổng doanh thu năm',
              value: formatCurrency(totalRevenue),
              color: '#10B981',
              icon: '💰',
              sub: `Năm ${year}`,
            },
            {
              label: 'Tổng lượt sửa chữa',
              value: `${totalRepairs} lượt`,
              color: '#06B6D4',
              icon: '🔧',
              sub: `${allVehicles.length} xe đã đăng ký`,
            },
            {
              label: 'Doanh thu TB/tháng',
              value: formatCurrency(avgRevenue),
              color: '#F59E0B',
              icon: '📊',
              sub: `Dựa trên ${revenue.length} tháng`,
            },
            {
              label: 'Tháng cao nhất',
              value: bestMonth.month ? `Tháng ${bestMonth.month}` : '—',
              color: '#8B5CF6',
              icon: '🏆',
              sub: bestMonth.revenue ? formatCurrency(bestMonth.revenue) : 'Chưa có dữ liệu',
            },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600,
                  textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</span>
              </div>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'1.375rem',
                fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={{ display:'flex', gap:4, background:'var(--bg-elevated)',
        padding:4, borderRadius:'var(--radius-md)', width:'fit-content' }}>
        {[
          ['revenue', '📈 Doanh thu'],
          ['repairs', '🔧 Lượt sửa'],
          ['brands',  '🚗 Theo hãng xe'],
          ['status',  '📋 Trạng thái'],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={tab === v ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            style={{ border:'none' }}>
            {l}
          </button>
        ))}
      </div>

      {/* CHART AREA */}
      {loading ? (
        <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
      ) : (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>

          {/* Tab: Doanh thu */}
          {tab === 'revenue' && (
            <>
              <h3 style={{ marginBottom: 4 }}>Doanh thu theo tháng — Năm {year}</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:'var(--space-lg)' }}>
                {chartData.length > 0
                  ? `${chartData.length} tháng có dữ liệu`
                  : 'Chưa có phiếu hoàn thành nào trong năm này'}
              </p>
              {chartData.length === 0 ? (
                <div className="empty-state" style={{ height: 240 }}>
                  <p>Chưa có dữ liệu doanh thu.<br/>Hãy đổi phiếu sửa chữa sang "Hoàn thành".</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top:5, right:10, bottom:0, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
                    <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:12 }}
                      axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `${(v/1e6).toFixed(0)}M`}
                      tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#06B6D4" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </>
          )}

          {/* Tab: Lượt sửa */}
          {tab === 'repairs' && (
            <>
              <h3 style={{ marginBottom: 4 }}>Lượt sửa chữa theo tháng — Năm {year}</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:'var(--space-lg)' }}>
                Tổng cộng {totalRepairs} lượt
              </p>
              {chartData.length === 0 ? (
                <div className="empty-state" style={{ height: 240 }}>
                  <p>Chưa có dữ liệu.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top:5, right:10, bottom:0, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
                    <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:12 }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="repairs" name="Lượt sửa"
                      stroke="#8B5CF6" strokeWidth={2.5}
                      dot={{ r:4, fill:'#8B5CF6' }}
                      activeDot={{ r:6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}

          {/* Tab: Theo hãng xe */}
          {tab === 'brands' && (
            <>
              <h3 style={{ marginBottom:'var(--space-lg)' }}>
                Doanh thu & số xe theo hãng — Năm {year}
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'var(--space-xl)' }}>
                {/* Table */}
                <div style={{ overflowX:'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Hãng xe</th>
                        <th>Lượt sửa</th>
                        <th>Số xe trong hệ thống</th>
                        <th>Doanh thu</th>
                        <th>Tỉ lệ DT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandData.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding: 24 }}>
                          Chưa có dữ liệu
                        </td></tr>
                      ) : brandData.map((b, i) => {
                        const pct = totalBrandRevenue > 0
                          ? Math.round((b.revenue / totalBrandRevenue) * 100) : 0;
                        return (
                          <tr key={i}>
                            <td className="text-muted">{i+1}</td>
                            <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{b.brand}</td>
                            <td className="font-mono">{b.repairs}</td>
                            <td className="font-mono">
                              {vehicleByBrand[b.brand] || 0} xe
                            </td>
                            <td>
                              <span className="money money-positive">
                                {formatCurrency(b.revenue)}
                              </span>
                            </td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ flex:1, height:6, background:'var(--bg-elevated)',
                                  borderRadius:3, overflow:'hidden', minWidth:60 }}>
                                  <div style={{ width:`${pct}%`, height:'100%',
                                    background:'var(--accent-cyan)', borderRadius:3 }} />
                                </div>
                                <span className="font-mono text-sm">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pie chart số xe theo hãng */}
                <div>
                  <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginBottom:10 }}>
                    Phân bổ xe theo hãng
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={vehicleBrandData} dataKey="count" nameKey="brand"
                        cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                        {vehicleBrandData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, name) => [`${v} xe`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:4, marginTop:8 }}>
                    {vehicleBrandData.slice(0, 6).map((b, i) => (
                      <li key={i} style={{ display:'flex', alignItems:'center', gap:8,
                        fontSize:'0.8125rem', color:'var(--text-secondary)' }}>
                        <span style={{ width:8, height:8, borderRadius:'50%',
                          background: PIE_COLORS[i], flexShrink:0 }} />
                        <span style={{ flex:1 }}>{b.brand}</span>
                        <span style={{ fontFamily:'var(--font-mono)', color:'var(--text-primary)',
                          fontWeight:600 }}>{b.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Tab: Trạng thái phiếu */}
          {tab === 'status' && (
            <>
              <h3 style={{ marginBottom: 'var(--space-lg)' }}>
                Thống kê trạng thái phiếu sửa chữa
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-xl)' }}>
                {/* Pie */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  {statusData.length === 0 ? (
                    <div className="empty-state"><p>Chưa có phiếu nào</p></div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={statusData} dataKey="value" nameKey="name"
                            cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4}>
                            {statusData.map((s, i) => (
                              <Cell key={i} fill={s.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v, name) => [`${v} phiếu`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <ul style={{ listStyle:'none', display:'flex', gap:'var(--space-lg)', flexWrap:'wrap', justifyContent:'center' }}>
                        {statusData.map((s, i) => (
                          <li key={i} style={{ display:'flex', alignItems:'center', gap:8,
                            fontSize:'0.875rem', color:'var(--text-secondary)' }}>
                            <span style={{ width:10, height:10, borderRadius:'50%',
                              background:s.color }} />
                            <span>{s.name}</span>
                            <strong style={{ color:s.color }}>{s.value}</strong>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* Summary table */}
                <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-md)' }}>
                  {[
                    { label:'Tổng phiếu', value: allRepairs.length, color:'var(--accent-cyan)', icon:'📋' },
                    { label:'Đang thực hiện', value: repairByStatus['in-progress'] || 0, color:'var(--accent-orange)', icon:'🔧' },
                    { label:'Hoàn thành', value: repairByStatus['completed'] || 0, color:'var(--accent-green)', icon:'✅' },
                    { label:'Đã huỷ', value: repairByStatus['cancelled'] || 0, color:'var(--accent-red)', icon:'❌' },
                    { label:'Tổng xe trong hệ thống', value: allVehicles.length, color:'var(--accent-blue)', icon:'🚗' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'12px 16px', background:'var(--bg-elevated)',
                      borderRadius:'var(--radius-md)',
                      borderLeft:`3px solid ${item.color}`,
                    }}>
                      <span style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>
                        {item.icon} {item.label}
                      </span>
                      <strong style={{ color: item.color, fontFamily:'var(--font-display)',
                        fontSize:'1.125rem' }}>
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}