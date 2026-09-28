import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import QrGenerator from './components/QrGenerator';
import DynamicQrManager from './components/DynamicQrManager';
import QrScanner from './components/QrScanner';
import QrRedirectHandler from './components/QrRedirectHandler';
import { subscribeToAllQrCodes } from './firebase';

// Synchronous route parser to prevent any initial rendering flash of dashboard UI
function getInitialRedirectQrId() {
  if (typeof window === 'undefined') return null;
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);

  // 1. Direct path route e.g. `/r/qr_123` (Standard Vercel SPA rewrite)
  const pathMatch = pathname.match(/\/r\/([a-zA-Z0-9_-]+)/);
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  // 2. Hash route e.g. `/#/r/qr_123`
  if (hash && hash.startsWith('#/r/')) {
    const id = hash.replace('#/r/', '').trim();
    if (id) return id;
  }

  // 3. Query Param e.g. `?r=qr_123`
  if (searchParams.has('r')) {
    const id = searchParams.get('r').trim();
    if (id) return id;
  }

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [qrList, setQrList] = useState([]);
  const [rtdbConnected, setRtdbConnected] = useState(false);
  
  // Synchronous state initialization - ZERO flash of dashboard!
  const [redirectQrId, setRedirectQrId] = useState(getInitialRedirectQrId);

  // Listen to popstate and hashchange for SPA navigation
  useEffect(() => {
    const checkRedirectRoute = () => {
      setRedirectQrId(getInitialRedirectQrId());
    };

    window.addEventListener('popstate', checkRedirectRoute);
    window.addEventListener('hashchange', checkRedirectRoute);
    return () => {
      window.removeEventListener('popstate', checkRedirectRoute);
      window.removeEventListener('hashchange', checkRedirectRoute);
    };
  }, []);

  // Only subscribe to full QR list if NOT in redirect mode (saves bandwidth & speeds up redirect)
  useEffect(() => {
    if (redirectQrId) return;

    const unsubscribe = subscribeToAllQrCodes((list, err) => {
      if (err) {
        console.warn('Firebase RTDB error:', err);
        setRtdbConnected(false);
      } else {
        setRtdbConnected(true);
        setQrList(list || []);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [redirectQrId]);

  // If this page visit is a dynamic QR scan, render redirect handler immediately on Frame 0!
  if (redirectQrId) {
    return (
      <QrRedirectHandler
        qrId={redirectQrId}
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setRedirectQrId(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rtdbConnected={rtdbConnected}
        totalDynamicCount={qrList.length}
      />

      {/* Main Content Area */}
      <main className="main-container" style={{ flex: 1 }}>
        {/* Metric Overview Bar */}
        <StatsOverview qrList={qrList} />

        {/* Tab 1: QR Generator */}
        {activeTab === 'generator' && (
          <QrGenerator onSavedSuccess={() => setActiveTab('manager')} />
        )}

        {/* Tab 2: Dynamic Link Manager (Edit target URLs in real-time) */}
        {activeTab === 'manager' && (
          <DynamicQrManager qrList={qrList} rtdbConnected={rtdbConnected} />
        )}

        {/* Tab 3: Camera & File Scanner */}
        {activeTab === 'scanner' && (
          <QrScanner />
        )}
      </main>

      {/* Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
          background: 'rgba(9, 13, 22, 0.9)'
        }}
      >
        <p>
          QR Pulse &bull; Realtime Dynamic & Static QR Code System &bull; Powered by Firebase Realtime Database
        </p>
      </footer>
    </div>
  );
}
