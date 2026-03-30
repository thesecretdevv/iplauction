'use client';

const GOLD = '#E8B84B';
const DANGER = '#ef4444';
const INFO = '#22D3EE';

function getAccent(tone) {
  if (tone === 'danger') return DANGER;
  if (tone === 'info') return INFO;
  return GOLD;
}

function getButtonStyle(variant, accent) {
  if (variant === 'secondary') {
    return {
      background: '#121317',
      border: '1px solid #2a2d34',
      color: '#c9ced6',
    };
  }

  if (variant === 'danger') {
    return {
      background: DANGER,
      border: `1px solid ${DANGER}`,
      color: '#fff',
      boxShadow: '0 10px 24px rgba(239,68,68,0.24)',
    };
  }

  return {
    background: accent,
    border: `1px solid ${accent}`,
    color: '#000',
    boxShadow: `0 10px 24px ${accent}33`,
  };
}

export default function AppDialog({ isOpen, title, message, tone = 'default', actions = [], onClose }) {
  if (!isOpen) return null;

  const accent = getAccent(tone);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#0b0d10',
          border: `1px solid ${accent}44`,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2, color: accent }}>
            {title}
          </div>
        </div>

        <div style={{ padding: '18px 20px', color: '#c9ced6', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {message}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {actions.map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              onClick={action.onClick}
              style={{
                minWidth: 100,
                padding: '11px 16px',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.08em',
                transition: 'transform 0.15s ease, filter 0.15s ease',
                ...getButtonStyle(action.variant, accent),
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
