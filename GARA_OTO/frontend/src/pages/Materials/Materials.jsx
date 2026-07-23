import React, { useState, useMemo, useEffect } from 'react';
import { formatCurrency, getStockStatus } from '../../data/mockData';
import './Materials.css';
import materialService from '../../services/materialService';

const EMPTY = { name: '', unit: 'Cái', price: 0, stock: 0, minStock: 5, category: '' };
const CATEGORIES = ['Dầu nhớt', 'Lọc', 'Phanh', 'Điện', 'Động cơ', 'Truyền động', 'Thân xe', 'Khác'];

export default function Materials() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const res = await materialService.getAll();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [items, search]);

  const openAdd  = () => { setForm(EMPTY); setErrors({}); setModal('add'); };
  const openEdit = (i) => { setForm({...i}); setSelected(i); setErrors({}); setModal('edit'); };
  const openDel  = (i) => { setSelected(i); setModal('delete'); };
  const close    = () => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên vật tư';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      if (modal === 'add') {
        await materialService.create(form);
      } else {
        await materialService.update(selected._id || selected.id, form);
      }
      await loadMaterials();
      close();
    } catch (err) {
      alert(err.message || 'Lưu thất bại');
    }
  };

  const del = async () => {
    try {
      await materialService.delete(selected._id || selected.id);
      await loadMaterials();
      close();
    } catch (err) {
      alert(err.message || 'Xoá thất bại');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <p>Đang tải vật tư...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Quản lý vật tư</h1>
          <p>Tổng: <strong style={{color:'var(--accent-cyan)'}}>{items.length}</strong> mặt hàng</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Thêm vật tư
        </button>
      </div>

      <div className="card" style={{padding:'var(--space-md)'}}>
        <div className="toolbar">
          <div className="search-bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input-field" placeholder="Tìm tên vật tư, danh mục…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Tên vật tư</th><th>Đơn vị</th>
                <th>Đơn giá</th><th>Tồn kho</th><th>Tối thiểu</th>
                <th>Danh mục</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const s = getStockStatus(m);
                return (
                  <tr key={m.id}>
                    <td className="text-muted text-sm">{idx+1}</td>
                    <td style={{fontWeight:500,color:'var(--text-primary)'}}>{m.name}</td>
                    <td className="text-muted">{m.unit}</td>
                    <td><span className="money">{formatCurrency(m.price)}</span></td>
                    <td>
                      <span className="font-mono" style={{color: m.stock < m.minStock ? 'var(--accent-orange)' : 'var(--text-primary)'}}>
                        {m.stock}
                      </span>
                    </td>
                    <td className="text-muted font-mono">{m.minStock}</td>
                    <td>
                      <span style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.2)',color:'var(--accent-purple)',padding:'2px 8px',borderRadius:'var(--radius-sm)',fontSize:'0.75rem'}}>
                        {m.category}
                      </span>
                    </td>
                    <td><span className={`badge badge-${s.type} badge-dot`}>{s.label}</span></td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(m)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => openDel(m)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Thêm vật tư mới' : 'Chỉnh sửa vật tư'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Tên vật tư <span className="required">*</span></label>
                  <input className={`input-field ${errors.name ? 'input-error' : ''}`} value={form.name}
                    onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Nhập tên vật tư" />
                  {errors.name && <span style={{fontSize:'0.75rem',color:'var(--accent-red)'}}>{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn vị</label>
                  <input className="input-field" value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} placeholder="Cái, Lít, Bộ..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn giá (VNĐ)</label>
                  <input type="number" min="0" className="input-field" value={form.price}
                    onChange={e => setForm(f=>({...f,price:Number(e.target.value)}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tồn kho</label>
                  <input type="number" min="0" className="input-field" value={form.stock}
                    onChange={e => setForm(f=>({...f,stock:Number(e.target.value)}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tồn tối thiểu</label>
                  <input type="number" min="0" className="input-field" value={form.minStock}
                    onChange={e => setForm(f=>({...f,minStock:Number(e.target.value)}))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={close}>Huỷ</button>
              <button className="btn btn-primary" onClick={save}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal-box" style={{maxWidth:400}}>
            <div className="modal-body" style={{textAlign:'center',padding:'var(--space-2xl)'}}>
              <h3 style={{marginBottom:8}}>Xác nhận xoá</h3>
              <p>Xoá vật tư <strong style={{color:'var(--text-primary)'}}>{selected?.name}</strong>?</p>
            </div>
            <div className="modal-footer" style={{justifyContent:'center'}}>
              <button className="btn btn-ghost" onClick={close}>Huỷ</button>
              <button className="btn btn-danger" onClick={del}>Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}