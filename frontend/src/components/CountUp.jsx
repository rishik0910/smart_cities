import { useEffect, useState, useRef } from 'react';
export default function CountUp({ to, duration=800, className='' }) {
  const [count, setCount] = useState(0);
  const raf = useRef();
  useEffect(() => {
    if (to===0) return setCount(0);
    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now-start)/duration, 1);
      const e = 1 - Math.pow(1-p, 3);
      setCount(Math.round(to*e));
      if (p<1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  return <span className={`count-num ${className}`}>{count}</span>;
}
