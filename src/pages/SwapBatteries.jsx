import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Repeat, Zap } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';

export default function SwapBatteries() {
  const { profile } = useAuth();
  const { data, loading } = useFirestoreCollection('batteries');

  const mine = data.find((b) => b.bookedBy === profile?.id || b.assignedRider === profile?.id);
  const available = data.filter((b) => !b.isBooked && !b.isAssigned && !b.isCharging && b.id !== mine?.id);

  async function book(battery) {
    try {
      await updateDoc(doc(db, 'batteries', battery.id), {
        isBooked: true,
        bookedBy: profile.id,
        bookTime: serverTimestamp(),
      });
      toast.success(`${battery.batteryName || 'Battery'} booked — head to the swap station`);
    } catch {
      toast.error('Could not book that battery');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Swap Batteries</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Book a charged battery for pickup at the swap station.</p>
      </div>

      {mine && (
        <Panel className="mb-6 flex items-center justify-between border-brand-600/20 bg-brand-50/60 dark:bg-brand-900/20">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Zap size={18} /></span>
            <div>
              <p className="font-bold text-brand-900 dark:text-white">{mine.batteryName || 'Your battery'} is booked</p>
              <p className="text-sm text-brand-900/55 dark:text-white/50">{mine.batteryLevel ?? '—'}% charge · pick it up at the station</p>
            </div>
          </div>
          <Badge tone="brand">Booked</Badge>
        </Panel>
      )}

      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-900/50 dark:text-white/40">Available now</h3>
      {loading ? (
        <SkeletonGrid count={3} />
      ) : available.length === 0 ? (
        <EmptyState icon={Repeat} title="No batteries free right now" description="Every battery is booked, assigned or charging. Check back shortly." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {available.map((b) => (
            <Panel key={b.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-brand-900 dark:text-white">{b.batteryName || b.id}</p>
                <Badge tone="success">{b.batteryLevel ?? '—'}%</Badge>
              </div>
              <p className="text-xs text-brand-900/45 dark:text-white/40">{b.model || 'Standard cell'}</p>
              <Button size="sm" icon={Repeat} onClick={() => book(b)} disabled={!!mine}>
                Book this battery
              </Button>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
