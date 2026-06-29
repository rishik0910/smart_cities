import { useState, useCallback, useRef } from 'react';
let toastFn = null;
export function showToast(message, type='default') { if (toastFn) toastFn(message, type); }
export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  toastFn = useCallback((message, type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type, leaving:false }]);
    timers.current[id] = setTimeout(() => {
      setToasts(t => t.map(x => x.id===id ? { ...x, leaving:true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 260);
    }, 2800);
  }, []);
  const icons = { success:'✓', error:'✕', default:'ℹ' };
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type} ${t.leaving?'leaving':''}`}>
          <span style={{ fontWeight:700 }}>{icons[t.type]||icons.default}</span>{t.message}
        </div>
      ))}
    </div>
  );
}
