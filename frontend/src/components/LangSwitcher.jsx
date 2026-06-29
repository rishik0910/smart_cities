import { useTranslation } from './useTranslation';

const LANGS = [
  { code:'en', label:'EN', name:'English' },
  { code:'te', label:'తె', name:'Telugu' },
  { code:'hi', label:'हि', name:'Hindi'  },
];

export default function LangSwitcher() {
  const { lang, setLang } = useTranslation();
  return (
    <div style={{ display:'flex', gap:4 }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} title={l.name} style={{
          padding:'4px 9px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer',
          border: lang===l.code ? '2px solid var(--green-500)' : '1.5px solid var(--sand-200)',
          background: lang===l.code ? 'var(--green-50)' : 'var(--white)',
          color: lang===l.code ? 'var(--green-600)' : 'var(--sand-600)',
          fontFamily:'var(--font)', transition:'all 0.15s',
        }}>{l.label}</button>
      ))}
    </div>
  );
}
