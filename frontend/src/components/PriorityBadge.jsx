const config = {
  critical:{ bg:'#FEE2E2',color:'#991B1B',label:'Critical',icon:'🔴' },
  high:    { bg:'#FAEEDA',color:'#633806',label:'High',    icon:'🟠' },
  medium:  { bg:'#DBEAFE',color:'#1E40AF',label:'Medium',  icon:'🟡' },
  low:     { bg:'#EAF3DE',color:'#27500A',label:'Low',     icon:'🟢' },
};
export default function PriorityBadge({ priority }) {
  const c = config[priority]||config.medium;
  return (
    <span style={{background:c.bg,color:c.color,fontSize:10,fontWeight:700,
      padding:'3px 9px',borderRadius:20,display:'inline-flex',alignItems:'center',gap:4}}>
      {c.icon} {c.label}
    </span>
  );
}
