import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import "./Header.css";

const PAGE_TITLES = {
  '/':          { title: 'Dashboard', subtitle: 'Tổng quan hoạt động gara' },
  '/vehicles':  { title: 'Quản lý xe', subtitle: 'Danh sách và thông tin xe khách hàng' },
  '/repairs':   { title: 'Phiếu sửa chữa', subtitle: 'Quản lý các phiếu sửa chữa và bảo dưỡng' },
  '/materials': { title: 'Quản lý vật tư', subtitle: 'Kho phụ tùng và vật tư tiêu hao' },
  '/payments':  { title: 'Phiếu thu tiền', subtitle: 'Thanh toán và theo dõi công nợ' },
  '/reports':   { title: 'Báo cáo', subtitle: 'Thống kê doanh thu và hiệu suất' },
  '/settings':  { title: 'Cài đặt', subtitle: 'Cấu hình hệ thống' },
};

export default function Header({ onMobileMenuToggle }) {
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'GaraManager', subtitle: '' };
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(true);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getAll();
        const items = (response.data || []).map((notif) => ({ ...notif, read: false }));
        setNotifications(items);
      } catch (error) {
        console.error('Không tải được thông báo:', error.message);
      } finally {
        setIsLoadingNotifs(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="header">
      {/* Left: Mobile menu + breadcrumb */}
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMobileMenuToggle} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="header-title">
          <h2>{pageInfo.title}</h2>
          <p className="header-subtitle">{pageInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: date + notifications + avatar */}
      <div className="header-right">
        <div className="header-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{dateStr}</span>
        </div>

        {/* Notification Bell */}
        <div className="notif-wrapper">
          <button
            className="icon-btn notif-btn"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUserMenuOpen(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span>Thông báo</span>
                <button
                  className="btn-link"
                  onClick={() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))}
                >
                  Đánh dấu đọc
                </button>
              </div>
              {isLoadingNotifs ? (
                <div className="notif-empty">Đang tải thông báo...</div>
              ) : notifications.length === 0 ? (
                <div className="notif-empty">Chưa có thông báo mới</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`notif-item notif-${n.type}`}>
                    <span className="notif-icon">{n.icon}</span>
                    <div>
                      <p>{n.text}</p>
                      <span className="notif-time">{n.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button
            type="button"
            className={`user-menu ${userMenuOpen ? 'is-open' : ''}`}
            onClick={() => {
              setUserMenuOpen((open) => !open);
              setNotifOpen(false);
            }}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar">
              <span>KD</span>
            </div>
            <div className="user-info">
              <span className="user-name">CAR TA</span>
              <span className="user-role">Quản lý</span>
            </div>
            <svg
              className="user-menu-chevron"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="user-menu-dropdown" role="menu">
              <div className="user-menu-panel">
                <span className="user-menu-panel-glow" aria-hidden="true" />
                <p className="user-menu-fun-text">
                  I love <strong>Michael Olise</strong> {' '}
                  <span className="user-menu-jersey">11</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}