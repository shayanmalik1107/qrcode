import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import QrGenerator from './components/QrGenerator';
import DynamicQrManager from './components/DynamicQrManager';
import QrScanner from './components/QrScanner';
import QrRedirectHandler from './components/QrRedirectHandler';
import { subscribeToAllQrCodes } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [qrList, setQrList] = useState([]);
  const [rtdbConnected, setRtdbConnected] = useState(false);
  const [redirectQrId, setRedirectQrId] = useState(null);

  // Detect if current URL is a dynamic QR redirect scan (e.g. `/#/r/qr_xyz` or `?r=qr_xyz`)
  useEffect(() => {
    const checkRedirectRoute = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

      // Check Hash route e.g. `/#/r/qr_123`
      if (hash && hash.startsWith('#/r/')) {
        const id = hash.replace('#/r/', '').trim();
        if (id) {
          setRedirectQrId(id);
          return;
        }
      }

      // Check Query Param e.g. `?r=qr_123`
      if (searchParams.has('r')) {
        const id = searchParams.get('r').trim();
        if (id) {
          setRedirectQrId(id);
          return;
        }
      }

      setRedirectQrId(null);
    };

    checkRedirectRoute();
    window.addEventListener('hashchange', checkRedirectRoute);
    return () => window.removeEventListener('hashchange', checkRedirectRoute);
  }, []);

  // Subscribe to Firebase Realtime DB QR records
  useEffect(() => {
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
  }, []);

  // If this page visit is a dynamic QR scan, render the high-tech redirect handler!
  if (redirectQrId) {
    return (
      <QrRedirectHandler
        qrId={redirectQrId}
        onGoHome={() => {
          window.location.hash = '';
          window.location.search = '';
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
