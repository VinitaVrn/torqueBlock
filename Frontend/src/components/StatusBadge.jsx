export default function StatusBadge({ type = 'order', status }) {
  if (!status) return null;

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-300';

  if (type === 'payment') {
    switch (status) {
      case 'Success':
        bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        break;
      case 'Pending':
        bgClass = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
      case 'Failed':
        bgClass = 'bg-rose-50 text-rose-700 border-rose-300';
        break;
      case 'Refunded':
        bgClass = 'bg-purple-50 text-purple-700 border-purple-300';
        break;
      default:
        bgClass = 'bg-slate-100 text-slate-700 border-slate-300';
    }
  } else {
    switch (status) {
      case 'Paid/Confirmed':
        bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';
        break;
      case 'Processing':
        bgClass = 'bg-sky-50 text-sky-700 border-sky-300';
        break;
      case 'Shipped':
        bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-300';
        break;
      case 'Delivered':
        bgClass = 'bg-teal-50 text-teal-700 border-teal-300';
        break;
      case 'Cancelled':
        bgClass = 'bg-rose-50 text-rose-700 border-rose-300';
        break;
      case 'Pending Payment':
      default:
        bgClass = 'bg-amber-50 text-amber-700 border-amber-300';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass}`}>
      {status}
    </span>
  );
}
