import React, { useState } from 'react';
import { 
  Edit3, 
  Check, 
  X, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  BarChart2, 
  Calendar, 
  Zap, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { updateQrDestinationUrl, toggleQrActiveState, deleteQrCodeFromDb } from '../firebase';
import { buildDynamicRedirectUrl, exportQrListToCsv, normalizeUrl, isValidUrl } from '../utils/qrHelpers';

export default function DynamicQrManager({ qrList, rtdbConnected }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'paused'
  
  // Inline link edit state
  const [editingId, setEditingId] = useState(null);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [savingEditId, setSavingEditId] = useState(null);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filtered QR List
  const filteredList = qrList.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destinationUrl || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.active) ||
      (statusFilter === 'paused' && !item.active);

    return matchesSearch && matchesStatus;
  });

  // Start inline URL edit
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditUrlInput(item.destinationUrl);
    setEditError('');
  };

  // Save updated destination URL to Firebase
  const handleSaveEdit = async (qrId) => {
    setEditError('');
    if (!editUrlInput.trim()) {
      setEditError('URL cannot be empty');
      return;
    }

    const normalized = normalizeUrl(editUrlInput);
    if (!isValidUrl(normalized)) {
      setEditError('Invalid URL format. Please include http:// or https://');
      return;
    }

    setSavingEditId(qrId);
    try {
      await updateQrDestinationUrl(qrId, normalized);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update URL:', err);
      setEditError('Failed to save to Firebase Realtime Database.');
    } finally {
      setSavingEditId(null);
    }
  };

  // Toggle active/paused state
  const handleToggleActive = async (qrId, currentState) => {
    try {
      await toggleQrActiveState(qrId, !currentState);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Confirm and delete QR code
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteQrCodeFromDb(deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      console.error('Failed to delete QR code:', err);
    }
  };

  // Copy redirect URL
  const handleCopyRedirectLink = (shortId) => {
    const url = buildDynamicRedirectUrl(shortId);
    navigator.clipboard.writeText(url);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Header & Search Controls */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>Dynamic Links <span className="gradient-text">Manager</span></span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Edit target URLs in real-time. Changes apply instantly to all printed QR codes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => exportQrListToCsv(qrList)}
            className="btn btn-secondary btn-sm"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by title, target URL, or short ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.6rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 1rem', width: 'auto' }}
            >
              <option value="all">All Links ({qrList.length})</option>
              <option value="active">Active Only</option>
              <option value="paused">Paused Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main QR Codes Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Zap size={48} style={{ color: 'var(--accent-primary)', opacity: 0.4, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {qrList.length === 0 ? 'No Dynamic QR Codes Created Yet' : 'No QR Codes Match Your Filter'}
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
              {qrList.length === 0 
                ? 'Create your first dynamic QR code in the Creator tab to start tracking scans and updating target URLs anytime!'
                : 'Try adjusting your search query or status filter above.'}
            </p>
          </div>
        ) : (
          <div className="qr-table-container">
            <table className="qr-table">
              <thead>
                <tr>
                  <th>Reference & Short ID</th>
                  <th>Destination Target URL (Editable)</th>
                  <th>Status</th>
                  <th>Scans</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const redirectUrl = buildDynamicRedirectUrl(item.id);
                  const isEditingThis = editingId === item.id;
                  const isSavingThis = savingEditId === item.id;

                  return (
                    <tr key={item.id}>
                      {/* Title & Short ID */}
                      <td style={{ minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {item.title || 'Untitled QR'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                          <span className="font-mono" style={{ color: 'var(--accent-secondary)' }}>{item.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyRedirectLink(item.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Copy Dynamic Scan Link"
                          >
                            {copiedId === item.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Destination URL (Inline Editable!) */}
                      <td style={{ minWidth: '320px' }}>
                        {isEditingThis ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                className="input-field"
                                value={editUrlInput}
                                onChange={(e) => setEditUrlInput(e.target.value)}
                                placeholder="https://..."
                                autoFocus
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={isSavingThis}
                                className="btn btn-primary btn-sm"
                                title="Save to Firebase DB"
                              >
                                {isSavingThis ? 'Saving...' : <Check size={14} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="btn btn-secondary btn-sm"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {editError && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>{editError}</span>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <a
                              href={item.destinationUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: 'var(--text-main)',
                                textDecoration: 'none',
                                maxWidth: '260px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.88rem'
                              }}
                              className="hover:underline"
                            >
                              {item.destinationUrl}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              style={{
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                color: 'var(--accent-primary)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem'
                              }}
                              title="Edit Destination URL"
                            >
                              <Edit3 size={12} />
                              <span>Edit URL</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Active / Paused Toggle Switch */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <label className="switch-toggle">
                            <input
                              type="checkbox"
                              checked={item.active !== false}
                              onChange={() => handleToggleActive(item.id, item.active !== false)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span className={item.active !== false ? 'badge badge-active' : 'badge badge-paused'}>
                            {item.active !== false ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </td>

                      {/* Scan Count Badge */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <BarChart2 size={16} style={{ color: 'var(--accent-secondary)' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.scans || 0}</span>
                        </div>
                        {item.lastScannedAt && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Last: {new Date(item.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      {/* Action Menu */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <a
                            href={redirectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="Test Dynamic Scan Redirect"
                          >
                            <ExternalLink size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            className="btn btn-danger btn-sm"
                            title="Delete QR Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Delete Dynamic QR Code?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong style={{ color: 'white' }}>{deletingItem.title || deletingItem.id}</strong>? Scans will stop resolving to target URL.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="button"
                onClick={() => setDeletingItem(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
