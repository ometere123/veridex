'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { formatDateTime } from '@/utils';
import type { Notification } from '@/types';

const ICONS: Record<string, string> = {
  evaluation_complete:   '⬡',
  rank_change:           '▲',
  reevaluation_approved: '↻',
  system:                '•',
};

export function NotificationsPanel() {
  // ── ALL hooks first — no early returns before this point ──────
  const { address } = useAccount();
  const [mounted, setMounted]               = useState(false);
  const [open, setOpen]                     = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [loading, setLoading]               = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Mount guard — only renders bell after client hydration
  useEffect(() => { setMounted(true); }, []);

  // Fetch notifications when wallet connects
  useEffect(() => {
    if (!address || !mounted) return;
    setLoading(true);
    fetch(`/api/notifications?wallet=${address}`)
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address, mounted]);

  // Close panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Derived values ─────────────────────────────────────────────
  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    if (!address) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: address }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  // ── Early exit after ALL hooks ─────────────────────────────────
  // Don't render anything until client-side (avoids hydration mismatch)
  if (!mounted || !address) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all"
        style={{
          background: open ? 'rgba(230,190,247,0.12)' : 'rgba(230,190,247,0.05)',
          border: '1px solid rgba(230,190,247,0.12)',
          color: '#e6bef7',
        }}
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: '#a855f7', color: '#fff' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-xl overflow-hidden shadow-2xl z-50"
          style={{
            background: '#0e0a1a',
            border: '1px solid rgba(230,190,247,0.14)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(230,190,247,0.08)' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#f5eeff' }}>
              Notifications
              {unread > 0 && (
                <span
                  className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(168,85,247,0.2)', color: '#e6bef7' }}
                >
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] transition-colors"
                style={{ color: '#9b86b8' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#e6bef7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9b86b8')}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2" style={{ color: '#6b5490' }}>
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(230,190,247,0.2)', borderTopColor: '#e6bef7' }}
                />
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: '#6b5490' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(230,190,247,0.04)',
                    background: n.read ? 'transparent' : 'rgba(230,190,247,0.03)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(230,190,247,0.08)', color: '#e6bef7' }}
                    >
                      {ICONS[n.type] ?? '•'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: n.read ? '#9b86b8' : '#f5eeff' }}>
                        {n.title}
                        {!n.read && (
                          <span
                            className="ml-1.5 w-1.5 h-1.5 rounded-full inline-block align-middle"
                            style={{ background: '#a855f7' }}
                          />
                        )}
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: '#6b5490' }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: '#3d2a6b' }}>
                        {formatDateTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
