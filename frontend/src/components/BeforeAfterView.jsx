export default function BeforeAfterView({ beforeUrl, afterUrl }) {
  if (!beforeUrl&&!afterUrl) return null;
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',
            color:'var(--sand-400)',marginBottom:5}}>Before</div>
          {beforeUrl ? (
            <div style={{borderRadius:'var(--radius-sm)',overflow:'hidden',aspectRatio:'4/3'}}>
              <img src={beforeUrl} alt="before" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
            </div>
          ) : (
            <div style={{borderRadius:'var(--radius-sm)',background:'var(--sand-50)',
              border:'1px dashed var(--sand-200)',aspectRatio:'4/3',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:11,color:'var(--sand-400)'}}>No photo</div>
          )}
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',
            color:afterUrl?'var(--green-600)':'var(--sand-400)',marginBottom:5}}>
            After {afterUrl&&'✓'}
          </div>
          {afterUrl ? (
            <div style={{borderRadius:'var(--radius-sm)',overflow:'hidden',aspectRatio:'4/3',
              border:'2px solid var(--green-200)'}}>
              <img src={afterUrl} alt="after" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
            </div>
          ) : (
            <div style={{borderRadius:'var(--radius-sm)',background:'var(--green-50)',
              border:'1px dashed var(--green-200)',aspectRatio:'4/3',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:11,color:'var(--green-600)',textAlign:'center',padding:8}}>
              Pending cleanup photo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
