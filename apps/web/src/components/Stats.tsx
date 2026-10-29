import type { SearchView } from '../lib/view.js';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
    </div>
  );
}

export function Stats({ view }: { view: SearchView }) {
  return (
    <div className="stats">
      <Stat label="Expanded" value={String(view.expanded)} />
      <Stat label="Queued" value={String(view.queued)} />
      <Stat label="Steps" value={view.path ? String(view.path.length - 1) : '—'} />
    </div>
  );
}
