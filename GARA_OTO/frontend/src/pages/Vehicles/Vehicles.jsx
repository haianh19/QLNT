import React, { useState, useMemo, useEffect } from 'react';
import {
  VEHICLE_BRANDS,
  formatCurrency, getStatusLabel,
} from '../../data/mockData';
import './Vehicles.css';
import vehicleService from '../../services/vehicleService';

const EMPTY_FORM = {
  licensePlate: '', owner: '', phone: '', address: '',
  brand: 'Toyota', debt: 0, status: 'waiting',
};

const STATUS_OPTIONS = [
  { value: 'waiting',   label: 'Chờ sửa' },
  { value: 'repairing', label: 'Đang sửa' },
  { value: 'done',      label: 'Hoàn thành' },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch]     = useState('');
  const [brandFilter, setBrand]  = useState('');
  const [statusFilter, setStatus]= useState('');
  const [modal, setModal]        = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected]  = useState(null);
  const [form, setForm]          = useState(EMPTY_FORM);
  const [errors, setErrors]      = useState({});
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleService.getAll();
      setVehicles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Filtered list ----
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vehicles.filter(v => {
      const matchSearch = !q || v.licensePlate.toLowerCase().includes(q) || v.owner.toLowerCase().includes(q) || v.phone.includes(q);
      const matchBrand  = !brandFilter  || v.brand === brandFilter;
      const matchStatus = !statusFilter || v.status === statusFilter;
      return matchSearch && matchBrand && matchStatus;
    });
  }, [vehicles, search, brandFilter, statusFilter]);

  // ---- Handlers ----
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal('add');
  };
  const openEdit = (v) => {
    setForm({ ...v });
    setSelected(v);
    setErrors({});
    setModal('edit');
  };
  const openDelete = (v) => {
    setSelected(v);
    setModal('delete');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.licensePlate.trim()) e.licensePlate = 'Vui lòng nhập biển số';
    if (!form.owner.trim())        e.owner = 'Vui lòng nhập tên chủ xe';
    if (!form.phone.trim())        e.phone = 'Vui lòng nhập số điện thoại';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (modal === 'add') {
        await vehicleService.create(form);
      } else {
        await vehicleService.update(selected._id, form);
      }
      await loadVehicles();
      closeModal();
    } catch (err) {
      alert(err.message || 'Lưu thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      await vehicleService.delete(selected._id);
      await loadVehicles();
      closeModal();
    } catch (err) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  return (
    <div className="page-wrapper">
      {/* ---- PAGE HEADER ---- */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Quản lý xe</h1>
          <p>Tổng: <strong style={{ color: 'var(--accent-cyan)' }}>{vehicles.length}</strong> xe | Hiển thị: <strong>{filtered.length}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <PlusIcon /> Thêm xe mới
        </button>
      </div>

      {/* ---- FILTERS ---- */}
      <div className="card filters-card">
        <div className="toolbar">
          <div className="search-bar">
            <SearchIcon />
            <input
              className="input-field"
              placeholder="Tìm biển số, chủ xe, SĐT…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field filter-select" value={brandFilter} onChange={e => setBrand(e.target.value)}>
            <option value="">Tất cả hãng xe</option>
            {VEHICLE_BRANDS.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="input-field filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {(search || brandFilter || statusFilter) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setBrand(''); setStatus(''); }}>
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* ---- TABLE ---- */}
      <div className="card table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <CarIcon size={48} />
            <p>Không tìm thấy xe nào.<br />Thử thay đổi điều kiện lọc.</p>
          </div>
        ) : (
          <div className="table-scroll-x">
            <table className="data-table vehicles-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Biển số</th>
                  <th>Chủ xe</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Hãng xe</th>
                  <th>Tiền nợ</th>
                  <th>Trạng thái</th>
                  <th>Ngày tiếp nhận</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, idx) => {
                  const status = getStatusLabel(v.status);
                  return (
                    <tr key={v.id}>
                      <td className="text-muted text-sm">{idx + 1}</td>
                      <td><span className="plate-badge">{v.licensePlate}</span></td>
                      <td>
                        <div className="owner-cell">
                          <div className="owner-avatar">{v.owner.charAt(0)}</div>
                          <span>{v.owner}</span>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{v.phone}</td>
                      <td className="address-cell truncate" title={v.address}>{v.address}</td>
                      <td><span className="brand-tag">{v.brand}</span></td>
                      <td>
                        <span className={`money ${v.debt > 0 ? 'money-warning' : 'money-positive'}`}>
                          {formatCurrency(v.debt)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${status.type} badge-dot`}>{status.label}</span>
                      </td>
                      <td className="text-muted text-sm font-mono">{v.createdAt}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(v)} title="Sửa">
                            <EditIcon />
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => openDelete(v)} title="Xóa">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- ADD/EDIT MODAL ---- */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>
                {modal === 'add' ? <><PlusIcon /> Thêm xe mới</> : <><EditIcon /> Chỉnh sửa thông tin xe</>}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Biển số xe <span className="required">*</span></label>
                  <input
                    className={`input-field ${errors.licensePlate ? 'input-error' : ''}`}
                    placeholder="Ví dụ: 88H-7777"
                    value={form.licensePlate}
                    onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))}
                  />
                  {errors.licensePlate && <span className="error-msg">{errors.licensePlate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Hãng xe</label>
                  <select className="input-field" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}>
                    {VEHICLE_BRANDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tên chủ xe <span className="required">*</span></label>
                  <input
                    className={`input-field ${errors.owner ? 'input-error' : ''}`}
                    placeholder="Họ và tên"
                    value={form.owner}
                    onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                  />
                  {errors.owner && <span className="error-msg">{errors.owner}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại <span className="required">*</span></label>
                  <input
                    className={`input-field ${errors.phone ? 'input-error' : ''}`}
                    placeholder="09xxxxxxxx"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>
                <div className="form-group full">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    className="input-field"
                    placeholder="Số nhà, đường, quận/huyện"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tiền nợ (VNĐ)</label>
                  <input
                    type="number" min="0"
                    className="input-field"
                    placeholder="0"
                    value={form.debt}
                    onChange={e => setForm(f => ({ ...f, debt: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Huỷ</button>
              <button className="btn btn-primary" onClick={handleSave}>
                <SaveIcon /> {modal === 'add' ? 'Thêm xe' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- DELETE CONFIRM ---- */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
              <div className="delete-icon-wrap"><TrashIcon /></div>
              <h3 style={{ marginTop: 'var(--space-md)', marginBottom: 8 }}>Xác nhận xoá</h3>
              <p>Bạn có chắc muốn xoá xe <strong style={{ color: 'var(--text-primary)' }}>{selected?.licensePlate}</strong> của <strong style={{ color: 'var(--text-primary)' }}>{selected?.owner}</strong>?</p>
              <p style={{ marginTop: 6, fontSize: '0.8125rem' }}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={closeModal}>Huỷ</button>
              <button className="btn btn-danger" onClick={handleDelete}><TrashIcon /> Xoá xe</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- SVG ICONS ----
function PlusIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function EditIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function CloseIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function SaveIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function CarIcon({ size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>; }