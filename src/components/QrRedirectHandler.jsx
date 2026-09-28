import React, { useEffect, useState } from 'react';
import { fetchQrCodeById, recordQrScan } from '../firebase';
import { AlertTriangle, PauseCircle } from 'lucide-react';

export default function QrRedirectHandler({ qrId, onGoHome }) {
  const [status, setStatus] = useState('redirecting'); // 'redirecting' | 'paused' | 'not_found' | 'error'
  const [qrTitle, setQrTitle] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function processRedirect() {
      if (!qrId) {
        if (isMounted) setStatus('not_found');
        return;
      }

      try {
        const qrData = await fetchQrCodeById(qrId);
        
        if (!isMounted) return;

        if (!qrData) {
          setStatus('not_found');
          return;
        }

        setQrTitle(qrData.title || qrData.id);

        if (qrData.active === false) {
          setStatus('paused');
          return;
        }

        // Active link found! Target URL:
        const dest = qrData.destinationUrl;
        if (!dest) {
          setStatus('error');
          return;
        }

        // Increment scan count in Firebase asynchronously without blocking
        recordQrScan(qrId);

        // DIRECT IMMEDIATE REDIRECT (0ms delay!)
        window.location.replace(dest);

      } catch (err) {
        console.error('Redirect processing error:', err);
        if (isMounted) setStatus('error');
      }
    }

    processRedirect();

    return () => { isMounted = false; };
  }, [qrId]);

  // Maintain browser default native loading screen during redirect
  if (status === 'redirecting') {
    return null;
  }

  return (
    <div className="redirect-overlay">
      {status === 'paused' && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <PauseCircle size={56} style={{ color: 'var(--accent-amber)', margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>QR Link Paused</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            This dynamic QR code (<span className="font-mono">{qrTitle}</span>) has been temporarily disabled by its manager.
          </p>
          <button type="button" onClick={onGoHome} className="btn btn-primary">
            Go to App Home
          </button>
        </div>
      )}

      {(status === 'not_found' || status === 'error') && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <AlertTriangle size={56} style={{ color: 'var(--accent-rose)', margin: '0 auto 1.25rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>QR Code Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The requested dynamic QR ID <span className="font-mono" style={{ color: 'var(--accent-rose)' }}>{qrId}</span> does not exist in Firebase Realtime Database.
          </p>
          <button type="button" onClick={onGoHome} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
