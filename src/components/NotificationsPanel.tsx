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
  // ── ALL hooks first - no early returns before this point ──────
  const { address } = useAccount();
  const [mounted, setMounted]               = useState(false);
  const [open, setOpen]                     = useState(false);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [loading, setLoading]               = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Mount guard - only renders bell after client hydration
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
          background: open ? 'rgba(184,99,63,0.12)' : 'rgba(184,99,63,0.05)',
          border: '1px solid rgba(184,99,63,0.12)',
          color: '#b8633f',
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
            style={{ background: '#8b7355', color: '#fff' }}
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
            background: '#fcf2e8',
            border: '1px solid rgba(184,99,63,0.14)',
            boxShadow: '0 24px 56px rgba(118,84,62,0.16)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(184,99,63,0.12)' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#4d3d30' }}>
              Notifications
              {unread > 0 && (
                <span
                  className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(184,99,63,0.16)', color: '#4d3d30' }}
                >
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] transition-colors"
                style={{ color: '#8c6f58' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#b07f5b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8c6f58')}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2" style={{ color: '#a38c7b' }}>
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(184,99,63,0.2)', borderTopColor: '#b8633f' }}
                />
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm" style={{ color: '#a38c7b' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(184,99,63,0.04)',
                    background: n.read ? 'transparent' : 'rgba(184,99,63,0.03)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(184,99,63,0.12)', color: '#b8633f' }}
                    >
                      {ICONS[n.type] ?? '•'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: n.read ? '#8c6f58' : '#4d3d30' }}>
                        {n.title}
                        {!n.read && (
                          <span
                            className="ml-1.5 w-1.5 h-1.5 rounded-full inline-block align-middle"
                            style={{ background: '#b8633f' }}
                          />
                        )}
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: '#6b584a' }}>
                        {n.message}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: '#8c7968' }}>
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
