// Lightweight toast notifications without external deps
// Usage: showToast('Saved'); showSuccess('Done'); showError('Oops');

function ensureRoot() {
  let root = document.getElementById('donorly-toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'donorly-toast-root';
    Object.assign(root.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 99999,
      pointerEvents: 'none',
    });
    document.body.appendChild(root);
  }
  return root;
}

function colorFor(type) {
  switch (type) {
    case 'success':
      return { bg: '#059669', fg: '#fff' }; // emerald-600
    case 'error':
      return { bg: '#dc2626', fg: '#fff' }; // red-600
    case 'warning':
      return { bg: '#d97706', fg: '#111827' }; // amber-600
    default:
      return { bg: '#2563eb', fg: '#fff' }; // blue-600
  }
}

export function showToast(message, { type = 'info', duration = 3000 } = {}) {
  try {
    const root = ensureRoot();
    const { bg, fg } = colorFor(type);

    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      pointerEvents: 'auto',
      background: bg,
      color: fg,
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      fontSize: '14px',
      fontWeight: 600,
      transform: 'translateY(6px)',
      opacity: '0',
      transition: 'opacity 180ms ease, transform 180ms ease',
      maxWidth: '320px',
      wordBreak: 'break-word',
    });

    root.appendChild(toast);
    // Enter animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    const remove = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    };

    const timeout = setTimeout(remove, duration);
    toast.addEventListener('click', () => {
      clearTimeout(timeout);
      remove();
    });
  } catch (e) {
    // Fallback to alert if DOM not available
    console[type === 'error' ? 'error' : 'log'](message);
    if (typeof window !== 'undefined' && window.alert) {
      // Don't block UX with alert for success/info
      if (type === 'error') alert(message);
    }
  }
}

export const showSuccess = (msg, opts) => showToast(msg, { ...opts, type: 'success' });
export const showError = (msg, opts) => showToast(msg, { ...opts, type: 'error' });

export default { showToast, showSuccess, showError };
