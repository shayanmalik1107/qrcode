import React, { useState } from 'react';
import { QrCode, LayoutDashboard, ScanLine, Radio, Sparkles, Globe, Settings, X, Check } from 'lucide-react';
import { getBaseAppUrl, setBaseAppUrl } from '../utils/qrHelpers';

export default function Header({ activeTab, setActiveTab, rtdbConnected, totalDynamicCount }) {
  const [showSettings, setShowSettings] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(() => getBaseAppUrl());
  const [saveDomainMsg, setSaveDomainMsg] = useState('');

  const handleSaveDomain = (e) => {
    e.preventDefault();
    setBaseAppUrl(customDomainInput);
    setSaveDomainMsg('Vercel App Domain saved!');
    setTimeout(() => {
      setSaveDomainMsg('');
      setShowSettings(false);
    }, 1200);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <a href="#/" onClick={() => setActiveTab('generator')} className="logo-brand">
          <div className="logo-icon-wrapper">
            <QrCode size={24} className="text-white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

        {/* Database Status & Domain Config */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Radio size={16} style={{ color: rtdbConnected ? '#10b981' : '#f59e0b' }} />
            <span>RTDB:</span>
            <span style={{ color: rtdbConnected ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
              {rtdbConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary btn-sm"
            title="Configure Vercel App Domain"
            style={{ padding: '6px 10px' }}
          >
            <Globe size={14} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.78rem' }}>Vercel Domain</span>
          </button>
        </div>
      </div>

      {/* Domain Configuration Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Globe size={22} style={{ color: 'var(--accent-secondary)' }} />
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>Vercel App Domain Settings</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Enter your Vercel deployment URL (e.g. <span className="font-mono" style={{ color: 'var(--accent-secondary)' }}>https://your-app.vercel.app</span>) so that dynamic QR codes generated encode your public domain and work when scanned by any mobile phone!
            </p>

            <form onSubmit={handleSaveDomain}>
              <div className="form-group">
                <label className="form-label">Production Vercel Host URL</label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="https://qrcode-shayan.vercel.app"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                />
              </div>

              {saveDomainMsg && (
                <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <Check size={14} /> {saveDomainMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => { setBaseAppUrl(''); setCustomDomainInput(window.location.origin); }} className="btn btn-secondary btn-sm">
                  Reset to Current Origin
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Vercel Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
