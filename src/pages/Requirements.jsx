import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ClipboardList, Send } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Field, Input, Select } from '../components/ui/Field';
import { money } from '../lib/format';

function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function dayOfWeek(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}
function weekRangeLabel(d) {
  const day = d.getDay() === 0 ? 7 : d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${fmtDate(monday)} to ${fmtDate(sunday)}`;
}

/**
 * "Require" in the Flutter app: pick a rider + date, pull their previous
 * day's in-app balance from `users/{uid}.clockouts["dd MMM yyyy"]`, then
 * post a correction requirement into `users/{uid}.requirements.{id}` and
 * notify them via `users/{uid}.notifications.{id}`. There is no standalone
 * `requirements` collection — everything lives on the rider's own doc.
 */
export default function Requirements() {
  const { data: users, loading } = useFirestoreCollection('users');
  const riders = useMemo(() => users.filter((u) => u.userRank === 'Rider'), [users]);

  const [userId, setUserId] = useState('');
  const [date, setDate] = useState('');
  const [balance, setBalance] = useState('');
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedUser = users.find((u) => u.id === userId);
  const existingRequirements = useMemo(() => {
    const map = selectedUser?.requirements || {};
    return Object.entries(map)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [selectedUser]);

  useEffect(() => {
    if (!userId || !date) return;
    setFetchingBalance(true);
    (async () => {
      try {
        const prev = new Date(date);
        prev.setDate(prev.getDate() - 1);
        const key = fmtDate(prev);
        const snap = await getDoc(doc(db, 'users', userId));
        const clockouts = snap.data()?.clockouts || {};
        const prevBalance = clockouts[key]?.todaysInAppBalance ?? 0;
        setBalance(String(prevBalance));
      } catch {
        setBalance('0');
      } finally {
        setFetchingBalance(false);
      }
    })();
  }, [userId, date]);

  async function submit(e) {
    e.preventDefault();
    if (!userId || !date || balance === '') return;
    setBusy(true);
    try {
      const d = new Date(date);
      const formattedDate = fmtDate(d);
      const requirementId = Date.now().toString();
      const notificationId = (Date.now() + 1).toString();

      await updateDoc(doc(db, 'users', userId), {
        [`requirements.${requirementId}`]: {
          appBalance: Number(balance),
          date: formattedDate,
          dayOfWeek: dayOfWeek(d),
          weekRange: `Week (${weekRangeLabel(d)})`,
        },
        [`notifications.${notificationId}`]: {
          message: `You have been required to correct ${formattedDate}.`,
          time: new Date(),
          isRead: false,
        },
        numberOfNotifications: increment(1),
      });

      toast.success('Requirement created and rider notified');
      setBalance('');
      setDate('');
    } catch (err) {
      toast.error(err?.message || 'Could not create the requirement');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Panel className="lg:col-span-2 h-fit">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-brand-600" />
          <h2 className="font-bold text-brand-900 dark:text-white">Post a requirement</h2>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Rider">
            <Select required value={userId} onChange={(e) => setUserId(e.target.value)} disabled={loading}>
              <option value="">Select a rider…</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.userName || r.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date to correct">
            <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Previous day's balance (auto-filled, editable)" hint={fetchingBalance ? 'Fetching…' : undefined}>
            <Input required type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </Field>
          <Button type="submit" loading={busy} icon={Send} className="w-full" disabled={!userId || !date}>
            Create requirement
          </Button>
        </form>
      </Panel>

      <div className="lg:col-span-3">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-900/50 dark:text-white/40">
          {selectedUser ? `${selectedUser.userName || 'This rider'}'s requirements` : 'Pick a rider to see their history'}
        </h3>
        {selectedUser && existingRequirements.length === 0 && (
          <p className="text-sm text-brand-900/45 dark:text-white/40">No requirements on file for this rider yet.</p>
        )}
        <div className="space-y-3">
          {existingRequirements.map((r) => (
            <Panel key={r.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-900 dark:text-white">{r.date}</p>
                <p className="text-xs text-brand-900/45 dark:text-white/40">{r.dayOfWeek} · {r.weekRange}</p>
              </div>
              <Badge tone="warning">{money(r.appBalance)}</Badge>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
