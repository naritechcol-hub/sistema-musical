// src/components/Toast.jsx
// Toast interno con auto-ocultamiento y aria-live polite
import { useEffect } from 'react'

function Toast({ msg, type = 'success', onClear, delay = 3500 }) {
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(onClear, delay);
    return () => clearTimeout(t);
  }, [msg, onClear, delay]);

  if (!msg) return null;

  const icon = type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill';
  return (
    <div className={`sm-internal-toast show ${type}`} role="status" aria-live="polite">
      <i className={`bi bi-${icon}`} aria-hidden="true"></i>
      <span>{msg}</span>
    </div>
  );
}

export default Toast