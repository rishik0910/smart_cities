import { useState, useRef } from 'react';
import api from '../api';

async function compressImage(file) {
  return new Promise(res => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        let {width:w,height:h} = img;
        const max=1200;
        if(w>max||h>max){const r=Math.min(max/w,max/h);w=Math.round(w*r);h=Math.round(h*r);}
        c.width=w;c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        c.toBlob(b=>res(new File([b],file.name,{type:'image/jpeg'})),'image/jpeg',0.78);
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AIDetector({ onDetected, onFileReady }) {
  const [preview,   setPreview]   = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const ref = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setDetecting(true); setResult(null); setError('');
    const compressed = await compressImage(file);
    setPreview(URL.createObjectURL(compressed));
    onFileReady(compressed);

    try {
      const form = new FormData();
      form.append('image', compressed);
      const res = await api.post('/ai/detect', form, { headers:{'Content-Type':'multipart/form-data'} });
      setResult(res.data);
      if (res.data.success) onDetected(res.data);
    } catch {
      setError('AI detection failed — please select category manually');
    } finally { setDetecting(false); }
  };

  const severityColors = { low:'#27500A', medium:'#633806', high:'#1E40AF', critical:'#991B1B' };
  const severityBgs    = { low:'#EAF3DE', medium:'#FAEEDA', high:'#DBEAFE', critical:'#FEE2E2' };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment"
        style={{display:'none'}} onChange={handleFile} />
      {!preview ? (
        <div onClick={()=>ref.current.click()} style={{
          border:'2px dashed var(--sand-200)', borderRadius:'var(--radius-sm)',
          minHeight:120, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:8,
          cursor:'pointer', transition:'all 0.25s', padding:16,
          background:'linear-gradient(135deg,var(--green-50),var(--white))',
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--green-500)';e.currentTarget.style.transform='scale(1.01)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--sand-200)';e.currentTarget.style.transform='scale(1)';}}>
          <div style={{fontSize:32}}>🤖</div>
          <div style={{fontSize:13,fontWeight:700,color:'var(--green-600)'}}>Upload photo for AI detection</div>
          <div style={{fontSize:11,color:'var(--sand-400)',textAlign:'center'}}>
            AI will automatically detect the waste type, severity and priority
          </div>
        </div>
      ) : (
        <div style={{borderRadius:'var(--radius-sm)',overflow:'hidden',position:'relative'}}>
          <img src={preview} alt="uploaded" style={{width:'100%',maxHeight:180,objectFit:'cover',display:'block'}} />
          {detecting && (
            <div style={{position:'absolute',inset:0,background:'rgba(20,20,16,0.7)',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid rgba(255,255,255,0.3)',
                borderTop:'3px solid #fff',animation:'spin 0.8s linear infinite'}} />
              <div style={{color:'#fff',fontSize:13,fontWeight:600}}>🤖 AI analyzing photo...</div>
            </div>
          )}
          {result && result.success && (
            <div style={{position:'absolute',bottom:0,left:0,right:0,
              background:'linear-gradient(transparent,rgba(20,20,16,0.9))',padding:'20px 14px 12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                <span style={{fontSize:20}}>{result.icon}</span>
                <span style={{color:'#fff',fontSize:13,fontWeight:700}}>{result.label}</span>
                <span style={{marginLeft:'auto',fontSize:10,fontWeight:600,
                  background:'rgba(255,255,255,0.2)',color:'#fff',padding:'2px 8px',borderRadius:10}}>
                  {result.confidence}% confident
                </span>
              </div>
              {result.description && (
                <div style={{color:'rgba(255,255,255,0.75)',fontSize:11,lineHeight:1.5}}>
                  {result.description}
                </div>
              )}
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,
                  background:severityBgs[result.severity],color:severityColors[result.severity]}}>
                  {result.severity} severity
                </span>
                {result.is_emergency && (
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,
                    background:'#FEE2E2',color:'#991B1B'}}>⚠️ Emergency</span>
                )}
              </div>
            </div>
          )}
          <button onClick={()=>{setPreview(null);setResult(null);onFileReady(null);}} style={{
            position:'absolute',top:8,right:8,background:'rgba(20,20,16,0.6)',color:'#fff',
            border:'none',borderRadius:20,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer',
          }}>Retake</button>
        </div>
      )}
      {error && <div style={{fontSize:11,color:'#DC2626',marginTop:6,fontWeight:600}}>{error}</div>}
    </div>
  );
}
