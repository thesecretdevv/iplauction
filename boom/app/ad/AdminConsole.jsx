'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const BG = '#06070b';
const CARD = '#10131a';
const BORDER = '#232834';
const GOLD = '#e8b84b';
const CYAN = '#22d3ee';
const RED = '#ef4444';
const GREEN = '#4ade80';

function formatTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
}

function StatusPill({ children, color }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: 6,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        color,
        fontSize: 11,
        letterSpacing: 1,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function RoomCard({ room, busyCode, onDelete }) {
  const deleting = busyCode === room.code;

  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: 16,
        background: CARD,
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>{room.code}</div>
          <div style={{ color: '#9aa4b2', fontSize: 13, marginTop: 4 }}>{room.name || 'Untitled room'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <StatusPill color={room.isPrivate ? RED : CYAN}>{room.isPrivate ? 'PRIVATE' : 'PUBLIC'}</StatusPill>
          <StatusPill color={room.status === 'finished' ? RED : GREEN}>{String(room.status || 'unknown').toUpperCase()}</StatusPill>
          <StatusPill color={GOLD}>{String(room.mode || 'mega').toUpperCase()}</StatusPill>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8, color: '#cbd5e1', fontSize: 13 }}>
        <div>Host: <span style={{ color: '#fff' }}>{room.host || 'Unknown'}</span></div>
        <div>Type: <span style={{ color: '#fff' }}>{room.roomType || 'standard'}</span></div>
        <div>Players: <span style={{ color: '#fff' }}>{room.playerCount || 0}</span> · Spectators: <span style={{ color: '#fff' }}>{room.spectatorCount || 0}</span></div>
        <div>Phase: <span style={{ color: '#fff' }}>{room.currentPhase || '—'}</span></div>
        <div>Updated: <span style={{ color: '#fff' }}>{formatTime(room.updatedAt || room.finishedAt)}</span></div>
        {room.participants?.length ? (
          <div>
            Participants:{' '}
            <span style={{ color: '#fff' }}>
              {room.participants.map((player) => `${player.name}${player.teamId ? ` (${player.teamId})` : ''}`).join(', ')}
            </span>
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => onDelete(room.code)}
          disabled={deleting}
          style={{
            border: `1px solid ${RED}66`,
            background: deleting ? '#2a1111' : `${RED}18`,
            color: '#fff',
            borderRadius: 6,
            padding: '10px 14px',
            cursor: deleting ? 'wait' : 'pointer',
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          {deleting ? 'DELETING...' : 'DELETE ROOM'}
        </button>
      </div>
    </div>
  );
}

export default function AdminConsole({ initialAuthenticated }) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState({ active: [], finished: [] });
  const [busyCode, setBusyCode] = useState('');
  const [filter, setFilter] = useState('all');

  const loadRooms = useCallback(async () => {
    const response = await fetch('/api/admin/rooms', { cache: 'no-store' });
    if (response.status === 401) {
      setAuthenticated(false);
      setRooms({ active: [], finished: [] });
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load rooms');
    }
    setRooms({
      active: Array.isArray(data.active) ? data.active : [],
      finished: Array.isArray(data.finished) ? data.finished : [],
    });
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    loadRooms().catch((error) => {
      setMessage(error.message);
    });
  }, [authenticated, loadRooms]);

  const visibleRooms = useMemo(() => {
    const combined = [...rooms.active, ...rooms.finished];
    return combined.filter((room) => {
      if (filter === 'private') return room.isPrivate;
      if (filter === 'public') return !room.isPrivate;
      if (filter === 'active') return room.source === 'active';
      if (filter === 'finished') return room.source === 'finished';
      return true;
    });
  }, [filter, rooms]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setAuthenticated(true);
      setPassword('');
      await loadRooms();
    } catch (error) {
      setMessage(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setRooms({ active: [], finished: [] });
    setMessage('');
    setPassword('');
  };

  const handleDelete = async (code) => {
    const confirmed = window.confirm(`Delete room ${code}? This removes active and finished snapshots if they exist.`);
    if (!confirmed) return;

    setBusyCode(code);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/rooms/${encodeURIComponent(code)}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }
      await loadRooms();
    } catch (error) {
      setMessage(error.message || 'Delete failed');
    } finally {
      setBusyCode('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        padding: '32px 16px 48px',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: GOLD, fontSize: 14, letterSpacing: 4, fontWeight: 800 }}>SECRET ADMIN</div>
            <h1 style={{ marginTop: 8, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1 }}>Room Control</h1>
          </div>
          {authenticated ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => loadRooms().catch((error) => setMessage(error.message))}
                style={{
                  border: `1px solid ${CYAN}66`,
                  background: `${CYAN}15`,
                  color: CYAN,
                  borderRadius: 6,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                REFRESH
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  border: `1px solid ${BORDER}`,
                  background: '#181c24',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                LOG OUT
              </button>
            </div>
          ) : null}
        </div>

        {message ? (
          <div style={{ border: `1px solid ${RED}55`, background: `${RED}12`, color: '#fff', padding: 12, borderRadius: 8 }}>
            {message}
          </div>
        ) : null}

        {!authenticated ? (
          <form
            onSubmit={handleLogin}
            style={{
              maxWidth: 420,
              border: `1px solid ${BORDER}`,
              background: CARD,
              borderRadius: 8,
              padding: 20,
              display: 'grid',
              gap: 14,
            }}
          >
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                style={{
                  border: `1px solid ${BORDER}`,
                  background: '#0b0e14',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '12px 14px',
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: '#cbd5e1', fontSize: 13 }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                style={{
                  border: `1px solid ${BORDER}`,
                  background: '#0b0e14',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '12px 14px',
                }}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              style={{
                border: 'none',
                background: `linear-gradient(135deg, ${GOLD}, #b78412)`,
                color: '#000',
                borderRadius: 6,
                padding: '12px 14px',
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                ['all', 'All'],
                ['active', 'Active'],
                ['finished', 'Finished'],
                ['private', 'Private'],
                ['public', 'Public'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  style={{
                    border: `1px solid ${filter === value ? GOLD : BORDER}`,
                    background: filter === value ? `${GOLD}14` : CARD,
                    color: filter === value ? GOLD : '#cbd5e1',
                    borderRadius: 6,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {visibleRooms.length ? (
                visibleRooms.map((room) => (
                  <RoomCard key={`${room.source}-${room.code}`} room={room} busyCode={busyCode} onDelete={handleDelete} />
                ))
              ) : (
                <div style={{ border: `1px solid ${BORDER}`, background: CARD, borderRadius: 8, padding: 20, color: '#94a3b8' }}>
                  No rooms matched this filter.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
