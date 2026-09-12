import { useState } from 'react';
import { addDoc, collection, orderBy, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ShieldAlert, Send } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Field, Textarea, Select } from '../components/ui/Field';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo } from '../lib/format';

const SEVERITIES = ['Minor', 'Moderate', 'Severe'];

export default function ReportDamages() {
  const { profile } = useAuth();
  const { data } = useFirestoreCollection('damagesReports', orderBy('timestamp', 'desc'));
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [busy, setBusy] = useState(false);

  const mine = data.filter((d) => d.assignedRider === profile?.id || d.reportedBy === profile?.id).slice(0, 6);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'damagesReports'), {
        description,
        severity,
        reportedBy: profile.id,
        reportedByName: profile.userName || null,
        resolved: false,
        timestamp: serverTimestamp(),
      });
      toast.success('Damage reported to management');
      setDescription('');
      setSeverity('Minor');
    } catch {
      toast.error('Could not submit the report');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Panel className="lg:col-span-2 h-fit">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert size={18} className="text-danger" />
          <h2 className="font-bold text-brand-900 dark:text-white">Report damage</h2>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="What happened?">
            <Textarea required placeholder="Describe the damage, where it happened and to what asset…" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Severity">
            <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" loading={busy} icon={Send} className="w-full">
            Submit report
          </Button>
        </form>
      </Panel>

      <div className="lg:col-span-3">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-900/50 dark:text-white/40">Your recent reports</h3>
        {mine.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No reports yet" description="Anything you report will show up here so you can track its status." />
        ) : (
          <div className="space-y-3">
            {mine.map((d) => (
              <Panel key={d.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-900 dark:text-white">{d.description}</p>
                  <p className="mt-1 text-xs text-brand-900/45 dark:text-white/40">{timeAgo(d.timestamp)}</p>
                </div>
                <Badge tone={d.resolved ? 'success' : 'danger'}>{d.resolved ? 'Resolved' : 'Open'}</Badge>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
