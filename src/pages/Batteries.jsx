import { useMemo, useState } from 'react';
import { Search, BatteryFull } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';

function statusOf(b) {
  if (b.isCharging) return { label: 'Charging', tone: 'warning' };
  if (b.isBooked) return { label: 'Booked', tone: 'brand' };
  if (b.isAssigned) return { label: 'Assigned', tone: 'success' };
  return { label: 'Idle', tone: 'neutral' };
}

export default function Batteries() {
  const { data, loading } = useFirestoreCollection('batteries');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((b) => (b.batteryName || '').toLowerCase().includes(q) || (b.model || '').toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Batteries</h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Live charge level and assignment across the fleet.</p>
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-900/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batteries"
            className="w-52 rounded-xl border border-brand-900/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-600 dark:border-white/10 dark:bg-white/5"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BatteryFull} title="No batteries found" description="Batteries registered in Firestore will appear here in real time." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => {
            const s = statusOf(b);
            const level = Number(b.batteryLevel) || 0;
            return (
              <Panel key={b.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-brand-900 dark:text-white">{b.batteryName || b.id}</p>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-brand-900/50 dark:text-white/40">
                    <span>Charge</span>
                    <span className="font-mono tabular">{level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-900/[0.06] dark:bg-white/10">
                    <div
                      className={`h-full rounded-full ${level > 50 ? 'bg-success' : level > 20 ? 'bg-warning' : 'bg-danger'}`}
                      style={{ width: `${Math.max(4, level)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-brand-900/45 dark:text-white/40">
                  <span>{b.model || 'Standard cell'}</span>
                  <span>{b.networkType || '—'}</span>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
