import React, { useEffect, useState } from 'react';
import { fetchQrCodeById, recordQrScan } from '../firebase';
import { ExternalLink, AlertTriangle, PauseCircle, QrCode } from 'lucide-react';

export default function QrRedirectHandler({ qrId, onGoHome }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'redirecting' | 'paused' | 'not_found' | 'error'
  const [targetUrl, setTargetUrl] = useState('');
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

        setTargetUrl(dest);
        setStatus('redirecting');

        // Increment scan count in Firebase asynchronously
        recordQrScan(qrId);

        // Redirect after a 900ms smooth splash animation
        const timer = setTimeout(() => {
          window.location.replace(dest);
        }, 900);

        return () => clearTimeout(timer);

      } catch (err) {
        console.error('Redirect processing error:', err);
        if (isMounted) setStatus('error');
      }
    }

    processRedirect();

    return () => { isMounted = false; };
  }, [qrId]);

  return (
    <div className="redirect-overlay">
      {status === 'loading' && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
          <div className="spinner-ring" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Fetching Dynamic QR Link...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Querying Firebase Realtime Database for ID <span className="font-mono" style={{ color: 'var(--accent-secondary)' }}>{qrId}</span>
          </p>
        </div>
      )}

      {status === 'redirecting' && (
        <div className="glass-panel pulse-glow" style={{ padding: '3rem 2rem', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--gradient-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <ExternalLink size={32} className="text-white" />
          </div>
          <span className="badge badge-dynamic" style={{ marginBottom: '0.75rem' }}>⚡ Dynamic Redirect</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Redirecting You...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Connecting to destination for <strong style={{ color: 'white' }}>{qrTitle}</strong>
          </p>
          <div style={{ background: 'rgba(13, 17, 28, 0.8)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--accent-secondary)', wordBreak: 'break-all' }}>
            {targetUrl}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
            If you are not redirected automatically within 2 seconds, <a href={targetUrl} style={{ color: 'var(--accent-primary)' }}>click here</a>.
          </p>
        </div>
      )}

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
