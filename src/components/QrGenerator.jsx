import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Link as LinkIcon, 
  Globe, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  Layers, 
  Image as ImageIcon, 
  Save, 
  RefreshCw,
  QrCode as QrIcon,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { saveQrCodeToDb } from '../firebase';
import { generateShortId, buildDynamicRedirectUrl, normalizeUrl, isValidUrl } from '../utils/qrHelpers';

const PRESET_THEMES = [
  { name: 'Neon Cyber', fg: '#06b6d4', bg: '#090d16', dots: 'dots', eyes: 'extra-rounded' },
  { name: 'Indigo Glow', fg: '#6366f1', bg: '#090d16', dots: 'extra-rounded', eyes: 'extra-rounded' },
  { name: 'Emerald Luxe', fg: '#10b981', bg: '#090d16', dots: 'rounded', eyes: 'rounded' },
  { name: 'Sunset Rose', fg: '#f43f5e', bg: '#090d16', dots: 'classy', eyes: 'square' },
  { name: 'Classic Dark', fg: '#ffffff', bg: '#111827', dots: 'square', eyes: 'square' },
  { name: 'Crisp Light', fg: '#0f172a', bg: '#ffffff', dots: 'rounded', eyes: 'rounded' }
];

export default function QrGenerator({ onSavedSuccess }) {
  // QR Type: 'dynamic' | 'static'
  const [qrType, setQrType] = useState('dynamic');
  
  // Form state
  const [destinationUrl, setDestinationUrl] = useState('https://github.com/shayanmalik1107/qrcode');
  const [title, setTitle] = useState('');
  const [customShortId, setCustomShortId] = useState('');
  
  // Style states
  const [fgColor, setFgColor] = useState('#6366f1');
  const [bgColor, setBgColor] = useState('#090d16');
  const [dotsStyle, setDotsStyle] = useState('rounded');
  const [cornersStyle, setCornersStyle] = useState('extra-rounded');
  const [logoUrl, setLogoUrl] = useState('');
  
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedShortId, setGeneratedShortId] = useState(() => generateShortId());

  // Ref for QR code element
  const qrRef = useRef(null);
  const qrCodeStylingRef = useRef(null);

  // Compute actual payload encoded in QR code
  const activeShortId = customShortId.trim() || generatedShortId;
  const normalizedTargetUrl = normalizeUrl(destinationUrl);
  const encodedPayload = qrType === 'dynamic' 
    ? buildDynamicRedirectUrl(activeShortId) 
    : (normalizedTargetUrl || 'https://example.com');

  // Initialize and update QRCodeStyling instance
  useEffect(() => {
    const qrCode = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'canvas',
      data: encodedPayload,
      image: logoUrl || undefined,
      dotsOptions: {
        color: fgColor,
        type: dotsStyle
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornersStyle
      },
      cornersDotOptions: {
        color: fgColor
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.3
      }
    });

    qrCodeStylingRef.current = qrCode;

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.append(qrRef.current);
    }
  }, [encodedPayload, fgColor, bgColor, dotsStyle, cornersStyle, logoUrl]);

  // Handle Preset Selection
  const applyPreset = (preset) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
    setDotsStyle(preset.dots);
    setCornersStyle(preset.eyes);
  };

  // Generate new ID for next QR code
  const handleRegenerateId = () => {
    setGeneratedShortId(generateShortId());
    setCustomShortId('');
  };

  // Copy encoded payload link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(encodedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download handlers
  const handleDownload = (format = 'png') => {
    if (!qrCodeStylingRef.current) return;
    const filename = `${title || (qrType === 'dynamic' ? activeShortId : 'static_qr')}_qr`;
    qrCodeStylingRef.current.download({
      name: filename,
      extension: format
    });
  };

  // Save Dynamic QR to Firebase Realtime Database
  const handleSaveToDatabase = async () => {
    setErrorMsg('');
    setSaveSuccessMsg('');

    if (!destinationUrl.trim()) {
      setErrorMsg('Please enter a valid destination URL.');
      return;
    }

    if (!isValidUrl(destinationUrl)) {
      setErrorMsg('Invalid URL format. Please include http:// or https://');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: activeShortId,
        title: title.trim() || `Dynamic Link ${activeShortId}`,
        destinationUrl: normalizedTargetUrl,
        redirectUrl: encodedPayload,
        qrType: 'dynamic',
        active: true,
        scans: 0,
        createdAt: Date.now(),
        customization: {
          fgColor,
          bgColor,
          dotsStyle,
          cornersStyle,
          logoUrl
        }
      };

      await saveQrCodeToDb(payload);
      
      // Confetti burst on successful save!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSaveSuccessMsg(`Dynamic QR code successfully created & synced to Firebase!`);
      
      if (onSavedSuccess) onSavedSuccess();
      
      // Generate new short ID for next QR code creation
      handleRegenerateId();
      setTitle('');
    } catch (err) {
      console.error('Error saving QR code:', err);
      setErrorMsg('Failed to save to Firebase Realtime Database. Check network or rules.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Logo File Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Intro Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Create <span className="gradient-text">QR Code</span></span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
          Generate editable Dynamic QR codes connected to Firebase Realtime DB or classic unalterable Static QR codes.
        </p>
      </div>

      <div className="grid-2">
        {/* Left Column: Configuration Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* QR Type Selection Cards */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <span className="form-label" style={{ marginBottom: '0.75rem' }}>Select QR Code Type</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div 
                onClick={() => setQrType('dynamic')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${qrType === 'dynamic' ? 'var(--accent-secondary)' : 'var(--border-subtle)'}`,
                  background: qrType === 'dynamic' ? 'rgba(6, 182, 212, 0.08)' : 'rgba(13, 17, 28, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-dynamic">Dynamic QR</span>
                  <Zap size={16} className="text-cyan-400" style={{ color: '#06b6d4' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>Editable destination anytime!</strong> Tracks live scan counts in Firebase without reprinting.
                </p>
              </div>

              <div 
                onClick={() => setQrType('static')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${qrType === 'static' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: qrType === 'static' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(13, 17, 28, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-static">Static QR</span>
                  <ShieldCheck size={16} style={{ color: '#9ca3af' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Direct URL encoded into QR matrix. Permanent & offline-compatible. Cannot be edited.
                </p>
              </div>

            </div>
          </div>

          {/* URL & Info Input Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={18} style={{ color: 'var(--accent-secondary)' }} />
              Target Link & Metadata
            </h3>

            <div className="form-group">
              <label className="form-label">
                <span>Destination URL <span style={{ color: 'var(--accent-rose)' }}>*</span></span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>
                  {qrType === 'dynamic' ? 'Can be updated later' : 'Permanent'}
                </span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="https://yourwebsite.com/promotion"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
              />
            </div>

            {qrType === 'dynamic' && (
              <>
                <div className="form-group">
                  <label className="form-label">Title / Reference Label</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Summer Campaign Menu"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Unique Short Code</span>
                    <button 
                      type="button" 
                      onClick={handleRegenerateId}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={12} /> Auto Generate
                    </button>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input-field font-mono"
                      placeholder="custom_alias"
                      value={activeShortId}
                      onChange={(e) => setCustomShortId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                    Encoded QR Payload: <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{encodedPayload}</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Design Customization Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
              Appearance & Styling
            </h3>

            {/* Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="form-label" style={{ marginBottom: '0.5rem' }}>Theme Presets</span>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {PRESET_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => applyPreset(theme)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '99px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: fgColor === theme.fg ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: theme.fg }}></span>
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Foreground Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ width: '40px', height: '40px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    className="input-field font-mono"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Background Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: '40px', height: '40px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'none' }}
                  />
                  <input
                    type="text"
                    className="input-field font-mono"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Shape Customization */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Dots Style</label>
                <select 
                  className="input-field"
                  value={dotsStyle}
                  onChange={(e) => setDotsStyle(e.target.value)}
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="extra-rounded">Extra Rounded</option>
                  <option value="classy">Classy</option>
                </select>
              </div>

              <div>
                <label className="form-label">Corners Style</label>
                <select 
                  className="input-field"
                  value={cornersStyle}
                  onChange={(e) => setCornersStyle(e.target.value)}
                >
                  <option value="square">Square</option>
                  <option value="rounded">Rounded</option>
                  <option value="extra-rounded">Extra Rounded</option>
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="form-group">
              <label className="form-label">Center Logo (Optional)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                  id="logo-upload-input"
                />
                <label htmlFor="logo-upload-input" className="btn btn-secondary btn-sm">
                  <ImageIcon size={16} /> Choose Image...
                </label>
                {logoUrl && (
                  <button 
                    type="button" 
                    onClick={() => setLogoUrl('')} 
                    className="btn btn-danger btn-sm"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Live Interactive QR Preview & Download Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1.5rem' }}>
              <span className="form-label" style={{ margin: 0 }}>Live Preview</span>
              <span className={qrType === 'dynamic' ? 'badge badge-dynamic' : 'badge badge-static'}>
                {qrType === 'dynamic' ? '⚡ Dynamic DB Link' : '🔒 Static QR'}
              </span>
            </div>

            {/* QR Canvas Display */}
            <div 
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: bgColor,
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                display: 'inline-block',
                margin: '1rem 0'
              }}
            >
              <div ref={qrRef} />
            </div>

            {/* Target URL Preview */}
            <div 
              style={{
                width: '100%',
                background: 'rgba(13, 17, 28, 0.8)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                margin: '1rem 0',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block' }}>Target Destination:</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{normalizedTargetUrl || 'None'}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
                title="Copy Encoded Link"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            {qrType === 'dynamic' ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSaveToDatabase}
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                >
                  <Save size={18} />
                  <span>{isSaving ? 'Saving to Firebase DB...' : 'Save & Publish Dynamic QR'}</span>
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Saves link to Realtime DB so target URL can be edited anytime later.
                </p>
              </div>
            ) : (
              <div style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Static QR codes work directly without database redirection.
              </div>
            )}

            {/* Notification Messages */}
            {saveSuccessMsg && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={16} />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            {/* Download Formats */}
            <div style={{ width: '100%', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span className="form-label" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>Download Export Options</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleDownload('png')} 
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={14} /> PNG High Res
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDownload('svg')} 
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={14} /> SVG Vector
                </button>
                <button 
                  type="button" 
                  onClick={() => window.print()} 
                  className="btn btn-secondary btn-sm"
                >
                  Print QR
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
