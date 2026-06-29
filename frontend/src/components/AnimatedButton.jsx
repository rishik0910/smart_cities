import { useRef } from 'react';
export default function AnimatedButton({ children, className='', onClick, disabled, style, type }) {
  const ref = useRef();
  const handleClick = (e) => {
    if (disabled) return;
    const btn = ref.current;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top  - size/2;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
    onClick?.(e);
  };
  return (
    <button ref={ref} className={`btn ${className}`} onClick={handleClick}
      disabled={disabled} style={style} type={type}>{children}</button>
  );
}
