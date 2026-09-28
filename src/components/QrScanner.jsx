import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, Camera, Upload, ExternalLink, CheckCircle, RefreshCw, XCircle } from 'lucide-react';

export default function QrScanner({ onSelectQrToManage }) {
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'file'

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';

  // Start Camera Scanner
  const startCamera = async () => {
    setScanError('');
    setScanResult('');
    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setScanResult(decodedText);
          stopCamera();
        },
        (errorMessage) => {
          // ignore minor frame scan failures
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setScanError('Could not access camera. Please check permissions or upload a QR image.');
      setIsScanning(false);
    }
  };

  // Stop Camera Scanner
  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn(e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(console.warn);
      }
    };
  }, [isScanning]);

  // Handle Image File Upload for QR Decoding
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanError('');
    setScanResult('');
    
    try {
      const html5QrCode = new Html5Qrcode('file-qr-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      setScanResult(decodedText);
    } catch (err) {
      console.error('File scanning error:', err);
      setScanError('No QR code detected in this image. Please upload a clear QR image.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          <ScanLine size={32} style={{ color: 'var(--accent-secondary)' }} />
          <span>QR Code <span className="gradient-text">Scanner</span></span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
          Test dynamic & static QR codes live using your web camera or by uploading an image.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Toggle Mode */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <button
            type="button"
            className={`btn ${scanMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { stopCamera(); setScanMode('camera'); }}
          >
            <Camera size={18} />
            <span>Camera Mode</span>
          </button>

          <button
            type="button"
            className={`btn ${scanMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { stopCamera(); setScanMode('file'); }}
          >
            <Upload size={18} />
            <span>Image Upload Mode</span>
          </button>
        </div>

        {/* Camera Scanner Container */}
        {scanMode === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              id={scannerContainerId}
              style={{
                width: '100%',
                maxWidth: '400px',
                minHeight: '280px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'rgba(13, 17, 28, 0.9)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}
            >
              {!isScanning && !scanResult && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <Camera size={48} style={{ color: 'var(--accent-primary)', opacity: 0.6, marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.9rem' }}>Camera inactive. Click button below to start scanner.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {!isScanning ? (
                <button type="button" onClick={startCamera} className="btn btn-primary">
                  <Camera size={18} /> Start Camera Scan
                </button>
              ) : (
                <button type="button" onClick={stopCamera} className="btn btn-danger">
                  <XCircle size={18} /> Stop Camera
                </button>
              )}
            </div>
          </div>
        )}

        {/* File Upload Scanner */}
        {scanMode === 'file' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div id="file-qr-temp" style={{ display: 'none' }}></div>
            <div 
              style={{
                border: '2px dashed var(--border-glow)',
                borderRadius: 'var(--radius-md)',
                padding: '3rem 2rem',
                background: 'rgba(13, 17, 28, 0.5)',
                maxWidth: '420px',
                margin: '0 auto',
                cursor: 'pointer'
              }}
            >
              <Upload size={48} style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Upload QR Code Image</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Supports PNG, JPG, WEBP, or SVG images containing a QR code
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                id="file-scanner-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="file-scanner-input" className="btn btn-primary btn-sm">
                Select Image File
              </label>
            </div>
          </div>
        )}

        {/* Scan Results Display */}
        {scanResult && (
          <div 
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              textAlign: 'center'
            }}
          >
            <CheckCircle size={36} style={{ color: 'var(--accent-emerald)', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
              QR Code Decoded Successfully!
            </h3>

            <div 
              style={{
                background: 'rgba(13, 17, 28, 0.8)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                wordBreak: 'break-all',
                margin: '1rem 0'
              }}
              className="font-mono"
            >
              {scanResult}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem' }}>
              <a 
                href={scanResult} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-primary btn-sm"
              >
                <ExternalLink size={16} /> Open Link in Browser
              </a>

              <button 
                type="button" 
                onClick={() => { setScanResult(''); if (scanMode === 'camera') startCamera(); }}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={16} /> Scan Another
              </button>
            </div>
          </div>
        )}

        {scanError && (
          <div 
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          >
            {scanError}
          </div>
        )}
      </div>
    </div>
  );
}
