import { doc, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { CheckCircle2, ListTodo } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { timeAgo } from '../lib/format';

export default function QueuedDamages() {
  const { data, loading } = useFirestoreCollection('damagesReports', orderBy('timestamp', 'desc'));
  const open = data.filter((d) => !d.resolved);

  async function resolve(id) {
    try {
      await updateDoc(doc(db, 'damagesReports', id), { resolved: true, resolvedAt: serverTimestamp() });
      toast.success('Marked resolved');
    } catch {
      toast.error('Could not update that report');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Queued Damages</h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Everything still waiting on a fix.</p>
        </div>
        <Badge tone={open.length ? 'danger' : 'success'}>{open.length} open</Badge>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : open.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="Queue is clear" description="No outstanding damage reports right now." />
      ) : (
        <div className="space-y-3">
          {open.map((d) => (
            <Panel key={d.id} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold text-brand-900 dark:text-white">{d.description}</p>
                  {d.severity && <Badge tone={d.severity === 'Severe' ? 'danger' : d.severity === 'Moderate' ? 'warning' : 'neutral'}>{d.severity}</Badge>}
                </div>
                <p className="text-xs text-brand-900/45 dark:text-white/40">
                  Reported {timeAgo(d.timestamp)} {d.reportedByName ? `by ${d.reportedByName}` : ''}
                </p>
              </div>
              <Button size="sm" variant="outline" icon={CheckCircle2} onClick={() => resolve(d.id)}>
                Mark resolved
              </Button>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
