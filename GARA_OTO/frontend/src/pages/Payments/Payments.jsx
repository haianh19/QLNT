import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import vehicleService from '../../services/vehicleService';
import { formatCurrency } from '../../data/mockData';

export default function Payments() {
  const [payments, setPayments]   = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ vehicleId: '', amount: '', note: '' });
  const [errors, setErrors]       = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payRes, vehRes] = await Promise.all([
        paymentService.getAll(),
        vehicleService.getAll(),
      ]);
      setPayments(payRes.data || []);
      setVehicles(vehRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xe có debt > 0 mới hiện trong dropdown
  const vehiclesWithDebt = vehicles.filter(v => v.debt > 0);

  // Xe đang chọn
  const selectedVehicle = vehicles.find(
    v => String(v._id) === String(form.vehicleId)
  );

  const openModal = () => {
    setForm({ vehicleId: '', amount: '', note: '' });
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.vehicleId)
      e.vehicleId = 'Vui lòng chọn xe';
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = 'Số tiền phải lớn hơn 0';
    if (selectedVehicle && Number(form.amount) > selectedVehicle.debt)
      e.amount = `Số tiền vượt quá tiền nợ (${formatCurrency(selectedVehicle.debt)})`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await paymentService.create({
        vehicle: form.vehicleId,   // ✅ gửi đúng field 'vehicle'
        amount:  Number(form.amount),
        note:    form.note.trim(),
      });
      await loadData();
      setModal(false);
    } catch (err) {
      alert(err.message || 'Lưu thất bại');
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      {[1,2,3].map(i => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
      ))}
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Phiếu thu tiền</h1>
          <p>Quản lý thu tiền và công nợ • <strong style={{ color: 'var(--accent-cyan)' }}>{payments.length}</strong> phiếu</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <PlusIcon /> Lập phiếu thu
        </button>
      </div>

      {/* TABLE */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {payments.length === 0 ? (
          <div className="empty-state">
            <ReceiptIcon />
            <p>Chưa có phiếu thu nào.<br />Bấm "Lập phiếu thu" để bắt đầu.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Biển số</th>
                  <th>Chủ xe</th>
                  <th>Ngày thu</th>
                  <th>Số tiền thu</th>
                  <th>Nợ trước</th>
                  <th>Nợ sau</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p._id}>
                    <td className="text-muted text-sm">{i + 1}</td>
                    <td>
                      <span className="plate-badge">
                        {p.vehicle?.licensePlate || '—'}
                      </span>
                    </td>
                    <td>{p.vehicle?.owner || '—'}</td>
                    <td className="font-mono text-sm">
                      {new Date(p.paymentDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <span className="money money-positive">
                        {formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="money money-warning">
                        {formatCurrency(p.debtBefore)}
                      </span>
                    </td>
                    <td>
                      <span className={`money ${p.debtAfter > 0 ? 'money-warning' : 'money-positive'}`}>
                        {formatCurrency(p.debtAfter)}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3><ReceiptIcon /> Lập phiếu thu tiền</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

              {/* Chọn xe */}
              <div className="form-group">
                <label className="form-label">Chọn xe <span className="required">*</span></label>
                <select
                  className={`input-field ${errors.vehicleId ? 'input-error' : ''}`}
                  value={form.vehicleId}
                  onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value, amount: '' }))}
                >
                  <option value="">— Chọn biển số xe có nợ —</option>
                  {vehiclesWithDebt.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.licensePlate} – {v.owner} (Nợ: {formatCurrency(v.debt)})
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{errors.vehicleId}</span>
                )}
                {vehiclesWithDebt.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Không có xe nào đang có công nợ
                  </span>
                )}
              </div>

              {/* Thông tin xe */}
              {selectedVehicle && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-sm)',
                  background: 'rgba(6,182,212,0.04)',
                  border: '1px solid var(--accent-cyan-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Chủ xe</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedVehicle.owner}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Tiền đang nợ</span>
                    <strong style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}>
                      {formatCurrency(selectedVehicle.debt)}
                    </strong>
                  </div>
                </div>
              )}

              {/* Số tiền thu */}
              <div className="form-group">
                <label className="form-label">Số tiền thu (VNĐ) <span className="required">*</span></label>
                <input
                  type="number" min="0"
                  className={`input-field ${errors.amount ? 'input-error' : ''}`}
                  placeholder="Nhập số tiền thu"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
                {errors.amount && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{errors.amount}</span>
                )}
                {/* Nút thu đủ */}
                {selectedVehicle && selectedVehicle.debt > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 6, width: 'fit-content' }}
                    onClick={() => setForm(f => ({ ...f, amount: String(selectedVehicle.debt) }))}
                  >
                    Thu đủ ({formatCurrency(selectedVehicle.debt)})
                  </button>
                )}
              </div>

              {/* Ghi chú */}
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input
                  className="input-field"
                  placeholder="Ghi chú thêm..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>

              {/* Preview sau khi thu */}
              {selectedVehicle && form.amount && Number(form.amount) > 0 && (
                <div style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Nợ còn lại sau khi thu:</span>
                  <strong style={{ color: selectedVehicle.debt - Number(form.amount) > 0 ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                    {formatCurrency(Math.max(0, selectedVehicle.debt - Number(form.amount)))}
                  </strong>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <SaveIcon /> Lưu phiếu thu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- ICONS ----
function PlusIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CloseIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function SaveIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>; }
function ReceiptIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>; }