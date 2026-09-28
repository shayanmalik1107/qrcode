import React from 'react';
import { QrCode, LayoutDashboard, ScanLine, BarChart3, Radio, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, rtdbConnected, totalDynamicCount }) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <a href="#/" onClick={() => setActiveTab('generator')} className="logo-brand">
          <div className="logo-icon-wrapper">
            <QrCode size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>QR<span className="gradient-text">Pulse</span></span>
              <span className="badge badge-dynamic" style={{ fontSize: '0.65rem' }}>Dynamic DB</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '-2px' }}>
              Realtime Dynamic & Static QR System
            </p>
          </div>
        </a>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            <Sparkles size={18} />
            <span>QR Creator</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => setActiveTab('manager')}
          >
            <LayoutDashboard size={18} />
            <span>Dynamic Links</span>
            {totalDynamicCount > 0 && (
              <span 
                style={{
                  background: activeTab === 'manager' ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  fontSize: '0.75rem'
                }}
              >
                {totalDynamicCount}
              </span>
            )}
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            <ScanLine size={18} />
            <span>Camera Scanner</span>
          </button>
        </nav>

        {/* Database Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Radio size={16} className={rtdbConnected ? "text-emerald-400" : "text-amber-400"} style={{ color: rtdbConnected ? '#10b981' : '#f59e0b' }} />
          <span>Firebase RTDB:</span>
          <span style={{ color: rtdbConnected ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
            {rtdbConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
}
