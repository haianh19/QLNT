import React, { useState, useMemo, useEffect } from 'react';
import {
  LABOR_OPTIONS, formatCurrency, getStatusLabel,
} from '../../data/mockData';
import './Repairs.css';
import repairService from '../../services/repairService';
import vehicleService from '../../services/vehicleService';
import materialService from '../../services/materialService';

const EMPTY_ITEM = { id: Date.now(), content: '', materialId: '', materialName: '', qty: 1, unitPrice: 0, laborCost: 0, total: 0 };

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | 'view'
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [form, setForm] = useState({ vehicleId: '', date: new Date().toISOString().slice(0,10), note: '', items: [{ ...EMPTY_ITEM, id: 1 }] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [repRes, vehRes, matRes] = await Promise.all([
        repairService.getAll(),
        vehicleService.getAll(),
        materialService.getAll(),
      ]);
      setRepairs(repRes.data || []);
      setVehicles(vehRes.data || []);
      setMaterials(matRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return repairs.filter(r => {
      const plate = String(r.vehicle?.licensePlate || r.licensePlate || '').toLowerCase();
      const owner = String(r.vehicle?.owner || r.ownerName || '').toLowerCase();
      return !q || plate.includes(q) || owner.includes(q);
    });
  }, [repairs, search]);

  // ---- Form helpers ----
  const openAdd = () => {
    setForm({ vehicleId: '', date: new Date().toISOString().slice(0,10), note: '', items: [{ id: 1, content: '', materialId: '', materialName: '', qty: 1, unitPrice: 0, laborCost: 0, total: 0 }] });
    setModal('add');
  };
  const openView = (r) => {
    setSelected(r);
    setEditStatus(r.status);
    setModal('view');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleUpdateStatus = async () => {
    try {
      await repairService.update(selected._id, { status: editStatus });
      await loadData();
      closeModal();
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại');
    }
  };

  const updateItem = (id, field, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map(item => {
        if (item.id !== id) return item;
        let updated = { ...item, [field]: value };
        
        if (field === 'materialId') {
          const mat = materials.find(m => String(m._id || m.id) === String(value));
          updated.materialName = mat ? mat.name : '';
          updated.unitPrice = mat ? mat.price : 0;
        }
        
        // Ensure all numeric values are numbers
        const qty = Number(updated.qty) || 0;
        const unitPrice = Number(updated.unitPrice) || 0;
        const laborCost = Number(updated.laborCost) || 0;
        
        updated.total = (qty * unitPrice) + laborCost;
        
        return updated;
      }),
    }));
  };

  const addItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { id: Date.now(), content: '', materialId: '', materialName: '', qty: 1, unitPrice: 0, laborCost: 0, total: 0 }],
    }));
  };

  const removeItem = (id) => {
    setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  };

  const totalAmount = form.items.reduce((s, i) => s + (i.total || 0), 0);

  const selectedVehicle = vehicles.find(v => String(v._id || v.id) === String(form.vehicleId));

  const handleSave = async () => {
    if (!form.vehicleId || form.items.length === 0) return;

    const cleanItems = form.items.map(item => ({
      content:   item.content.trim() || 'Sửa chữa',  // tránh bị rỗng
      material:  item.materialId || undefined,         // ✅ đổi materialId → material
      materialName: item.materialName,
      qty:       Math.max(1, Number(item.qty) || 1),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
      laborCost: Math.max(0, Number(item.laborCost) || 0),
      total:     Math.max(0, Number(item.total) || 0),
    }));

    const repairData = {
      vehicle: String(form.vehicleId),  // ✅ đổi vehicleId → vehicle
      repairDate: form.date,
      status: 'in-progress',
      items: cleanItems,
      totalAmount: cleanItems.reduce((s, i) => s + i.total, 0),
      note: form.note.trim(),
    };

    try {
      await repairService.create(repairData);
      await loadData();
      closeModal();
    } catch (err) {
      alert(err.message || 'Lưu thất bại');
    }
  };

  return (
    <div className="page-wrapper">
      {/* HEADER */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Phiếu sửa chữa</h1>
          <p>Quản lý {repairs.length} phiếu sửa chữa</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <PlusIcon /> Lập phiếu mới
        </button>
      </div>

      {/* SEARCH */}
      <div className="card filters-card">
        <div className="toolbar">
          <div className="search-bar">
            <SearchIcon />
            <input className="input-field" placeholder="Tìm theo biển số, chủ xe…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card table-wrapper">
        <div className="table-scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Biển số xe</th>
                <th>Chủ xe</th>
                <th>Ngày sửa</th>
                <th>Hạng mục</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const status = getStatusLabel(r.status);
                return (
                  <tr key={r.id}>
                    <td className="text-muted text-sm">{idx + 1}</td>
                      <td><span className="plate-badge">{r.vehicle?.licensePlate || r.licensePlate || '—'}</span></td>
                      <td>{r.vehicle?.owner || r.ownerName || '—'}</td>
                      <td className="font-mono text-sm">{(r.repairDate || r.date) ? String((r.repairDate || r.date)).slice(0,10) : '—'}</td>
                    <td><span className="badge badge-info">{r.items.length} hạng mục</span></td>
                    <td><span className="money money-positive">{formatCurrency(r.totalAmount)}</span></td>
                    <td><span className={`badge badge-${status.type} badge-dot`}>{status.label}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openView(r)}>
                        <EyeIcon /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- ADD REPAIR MODAL ---- */}
      {modal === 'add' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3><WrenchIcon /> Lập phiếu sửa chữa mới</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body repair-modal-body">
              {/* Top info */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Chọn xe <span className="required">*</span></label>
                  <select className="input-field" value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}>
                    <option value="">— Chọn biển số xe —</option>
                    {vehicles.map(v => (
                      <option key={v._id || v.id} value={v._id || v.id}>{v.licensePlate} – {v.owner}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sửa chữa</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>

              {selectedVehicle && (
                <div className="vehicle-info-box">
                  <div className="vib-item"><span>Chủ xe</span><strong>{selectedVehicle.owner}</strong></div>
                  <div className="vib-item"><span>SĐT</span><strong>{selectedVehicle.phone}</strong></div>
                  <div className="vib-item"><span>Hãng xe</span><strong>{selectedVehicle.brand}</strong></div>
                  <div className="vib-item"><span>Tiền nợ</span><strong className="money-warning">{formatCurrency(selectedVehicle.debt)}</strong></div>
                </div>
              )}

              {/* Items table */}
              <div className="repair-items-section">
                <div className="section-header">
                  <h4>Hạng mục sửa chữa</h4>
                  <button className="btn btn-ghost btn-sm" onClick={addItem}><PlusIcon /> Thêm hạng mục</button>
                </div>

                <div className="repair-items-scroll">
                  <table className="repair-items-table">
                    <thead>
                      <tr>
                        <th>Nội dung</th>
                        <th>Vật tư phụ tùng</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Tiền công</th>
                        <th>Thành tiền</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map(item => (
                        <tr key={item.id}>
                          <td>
                            <input
                              className="input-field input-sm"
                              placeholder="Nội dung sửa"
                              value={item.content}
                              onChange={e => updateItem(item.id, 'content', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="input-field input-sm"
                              value={item.materialId}
                              onChange={e => updateItem(item.id, 'materialId', e.target.value)}
                            >
                              <option value="">— Chọn vật tư —</option>
                              {materials.map(m => (
                                <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({formatCurrency(m.price)}/{m.unit})</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number" min="1"
                              className="input-field input-sm input-number"
                              value={item.qty}
                              onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="number" min="0"
                              className="input-field input-sm input-number"
                              value={item.unitPrice}
                              onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <select
                              className="input-field input-sm"
                              value={item.laborCost}
                              onChange={e => updateItem(item.id, 'laborCost', Number(e.target.value))}
                            >
                              <option value="0">Chọn công</option>
                              {LABOR_OPTIONS.map(l => (
                                <option key={l.id} value={l.price}>{l.name} ({formatCurrency(l.price)})</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <span className="money money-positive">{formatCurrency(item.total)}</span>
                          </td>
                          <td>
                            {form.items.length > 1 && (
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(item.id)}>
                                <TrashIcon />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="repair-total">
                  <span>Tổng thành tiền:</span>
                  <span className="repair-total-value">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Note */}
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <SaveIcon /> Lưu phiếu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- VIEW REPAIR MODAL ---- */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3><EyeIcon /> Chi tiết phiếu sửa chữa</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              {/* ---- THÔNG TIN PHIẾU ---- */}
              <div className="view-grid">
                <div className="view-item">
                  <span>Biển số</span>
                  <strong className="plate-badge">
                    {selected.vehicle?.licensePlate || '—'}
                  </strong>
                </div>

                <div className="view-item">
                  <span>Chủ xe</span>
                  <strong>{selected.vehicle?.owner || '—'}</strong>
                </div>

                <div className="view-item">
                  <span>Ngày sửa</span>
                  <strong className="font-mono">
                    {selected.repairDate
                      ? new Date(selected.repairDate).toLocaleDateString('vi-VN')
                      : '—'}
                  </strong>
                </div>

                <div className="view-item">
                  <span>Hãng xe</span>
                  <strong>{selected.vehicle?.brand || '—'}</strong>
                </div>
              </div>

              {/* ---- ĐỔI TRẠNG THÁI ---- */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                background: 'rgba(6,182,212,0.04)',
                border: '1px solid var(--accent-cyan-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginTop: 'var(--space-md)',
              }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, flexShrink: 0 }}>
                  Trạng thái:
                </span>
                <select
                  className="input-field"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  style={{ flex: 1, maxWidth: 220 }}
                >
                  <option value="in-progress">🔧 Đang thực hiện</option>
                  <option value="completed">✅ Hoàn thành</option>
                  <option value="cancelled">❌ Huỷ</option>
                </select>

                {editStatus !== selected.status && (
                  <button className="btn btn-primary btn-sm" onClick={handleUpdateStatus}>
                    <SaveIcon /> Cập nhật
                  </button>
                )}

                {editStatus === selected.status && (
                  <span className={`badge badge-${getStatusLabel(selected.status).type} badge-dot`}>
                    {getStatusLabel(selected.status).label}
                  </span>
                )}
              </div>

              <div className="divider" />

              {/* ---- HẠNG MỤC ---- */}
              <h4 style={{ marginBottom: 10 }}>Hạng mục sửa chữa</h4>
              <div className="table-scroll-x">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nội dung</th>
                      <th>Vật tư</th>
                      <th>SL</th>
                      <th>Đơn giá</th>
                      <th>Tiền công</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items?.map((item, i) => (
                      <tr key={item._id || i}>
                        <td className="text-muted">{i + 1}</td>
                        <td>{item.content || '—'}</td>
                        <td>{item.material?.name || item.materialName || '—'}</td>
                        <td className="font-mono">{item.qty}</td>
                        <td className="money">{formatCurrency(item.unitPrice)}</td>
                        <td className="money">{formatCurrency(item.laborCost)}</td>
                        <td>
                          <span className="money money-positive">
                            {formatCurrency(item.total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ---- TỔNG TIỀN ---- */}
              <div className="repair-total" style={{ marginTop: 12 }}>
                <span>Tổng cộng:</span>
                <span className="repair-total-value">
                  {formatCurrency(selected.totalAmount)}
                </span>
              </div>

              {selected.note && (
                <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  📝 Ghi chú: {selected.note}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function PlusIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function WrenchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>; }
function EyeIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function TrashIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>; }
function CloseIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function SaveIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>; }