import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { BatteryCharging, Plug, PlugZap } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';

export default function ChargeBatteries() {
  const { data, loading } = useFirestoreCollection('batteries');

  async function toggleCharging(b) {
    try {
      await updateDoc(doc(db, 'batteries', b.id), { isCharging: !b.isCharging });
      toast.success(b.isCharging ? 'Taken off charge' : 'Plugged in to charge');
    } catch {
      toast.error('Could not update that battery');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Charge Batteries</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Plug in or unplug batteries at the charging bay.</p>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : data.length === 0 ? (
        <EmptyState icon={BatteryCharging} title="No batteries registered" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((b) => {
            const level = Number(b.batteryLevel) || 0;
            return (
              <Panel key={b.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-brand-900 dark:text-white">{b.batteryName || b.id}</p>
                  {b.isCharging && (
                    <span className="flex items-center gap-1 text-xs font-bold text-warning">
                      <PlugZap size={14} /> Charging
                    </span>
                  )}
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-brand-900/[0.06] dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${level > 50 ? 'bg-success' : level > 20 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${Math.max(4, level)}%` }}
                  />
                </div>
                <Button
                  size="sm"
                  variant={b.isCharging ? 'outline' : 'primary'}
                  icon={Plug}
                  onClick={() => toggleCharging(b)}
                >
                  {b.isCharging ? 'Unplug' : 'Plug in to charge'}
                </Button>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
