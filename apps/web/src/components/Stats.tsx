import type { SearchView } from '../lib/view.js';

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className={`stat__value${highlight ? ' stat__value--accent' : ''}`}>{value}</span>
    </div>
  );
}

/** Costs are mostly whole numbers until diagonals bring in multiples of root two. */
const formatCost = (cost: number) => (Number.isInteger(cost) ? String(cost) : cost.toFixed(1));

export function Stats({ view }: { view: SearchView }) {
  return (
    <div className="stats">
      <Stat label="Expanded" value={String(view.expanded)} />
      <Stat label="Queued" value={String(view.queued)} />
      <Stat label="Cost" value={view.cost === null ? '—' : formatCost(view.cost)} highlight={view.cost !== null} />
      <Stat label="Steps" value={view.path ? String(view.path.length - 1) : '—'} />
    </div>
  );
}
