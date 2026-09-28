import React from 'react';
import { Zap, Eye, CheckCircle2, PauseCircle } from 'lucide-react';

export default function StatsOverview({ qrList }) {
  const totalDynamic = qrList.length;
  const totalScans = qrList.reduce((acc, curr) => acc + (curr.scans || 0), 0);
  const activeCount = qrList.filter(item => item.active !== false).length;
  const pausedCount = totalDynamic - activeCount;

  return (
    <div className="grid-4" style={{ marginBottom: '2rem' }}>
      {/* Total Dynamic Links */}
      <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dynamic Links</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-secondary)' }}>
            <Zap size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
          {totalDynamic}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Firebase Realtime DB</span>
      </div>

      {/* Total Scans */}
      <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Scans</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Eye size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
          {totalScans}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live Scans Recorded</span>
      </div>

      {/* Active Links */}
      <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Links</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
          {activeCount}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Redirects Active</span>
      </div>

      {/* Paused Links */}
      <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Paused Links</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
            <PauseCircle size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
          {pausedCount}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Redirect Disabled</span>
      </div>
    </div>
  );
}
