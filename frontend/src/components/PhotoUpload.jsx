import { useState, useRef } from 'react';
async function compress(file) {
  return new Promise(res => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        let { width: w, height: h } = img;
        const max = 1200;
        if (w > max || h > max) { const r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob(b => res(new File([b], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.78);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
export default function PhotoUpload({ onFileReady }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef();
  const handle = async e => {
    const f = e.target.files[0]; if (!f) return;
    setBusy(true);
    const comp = await compress(f);
    setPreview(URL.createObjectURL(comp));
    onFileReady(comp); setBusy(false);
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handle} />
      {!preview ? (
        <div className="photo-zone" onClick={() => ref.current.click()}>
          <span style={{ fontSize: 26 }}>📷</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--sand-400)' }}>Tap to take or upload a photo</span>
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: 150 }}>
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <button onClick={() => { setPreview(null); onFileReady(null); }} style={{
            position: 'absolute', top: 8, right: 8, background: 'rgba(20,20,16,0.6)', color: '#fff',
            border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font)'
          }}>Remove</button>
          {busy && <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600
          }}>Compressing...</div>}
        </div>
      )}
    </>
  );
}
