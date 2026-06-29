const labels = { pending: 'Pending', assigned: 'Assigned', in_progress: 'In progress', resolved: 'Resolved', rejected: 'Rejected' };
export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status || 'pending'}`}>{labels[status] || 'Pending'}</span>;
}
