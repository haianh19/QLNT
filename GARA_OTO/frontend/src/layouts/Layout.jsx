import React, { useState } from 'react';
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import './Layout.css';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${mobileOpen ? 'mobile-visible' : ''}`}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />
      </div>

      {/* Main Area */}
      <div className="main-wrapper">
        <Header onMobileMenuToggle={() => setMobileOpen(o => !o)} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}