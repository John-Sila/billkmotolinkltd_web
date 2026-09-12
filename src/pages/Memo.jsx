import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { MessageSquareText, Send, Clock } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { Field, Input, Textarea } from '../components/ui/Field';
import { timeAgo, toDate } from '../lib/format';

const EXPIRY_OPTIONS = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '4 hours', minutes: 240 },
  { label: '24 hours', minutes: 1440 },
];

/**
 * The Flutter app's Memo page posts a single company-wide banner to
 * `memo/latest` (there's no growing list of memo documents — a new memo
 * simply overwrites the last one).
 */
export default function Memo() {
  const { data } = useFirestoreCollection('memo');
  const latest = data.find((d) => d.id === 'latest');
  const expired = latest?.expiresAt && toDate(latest.expiresAt) < new Date();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [department, setDepartment] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await setDoc(doc(db, 'memo', 'latest'), {
        title,
        body,
        to: department || 'All Departments',
        from: '',
        department: department || 'All Departments',
        postedAt: new Date(),
        readBy: [],
        expiresAt: new Date(Date.now() + expiryMinutes * 60000),
      });
      toast.success('Memo posted to the team');
      setTitle('');
      setBody('');
      setDepartment('');
    } catch (err) {
      toast.error(err?.message || 'Could not post that memo');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Panel className="lg:col-span-2 h-fit">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText size={18} className="text-brand-600" />
          <h2 className="font-bold text-brand-900 dark:text-white">Post a memo</h2>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Message">
            <Textarea required value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Field label="Department (optional)">
            <Input placeholder="All Departments" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </Field>
          <Field label="Expires in">
            <div className="flex flex-wrap gap-2">
              {EXPIRY_OPTIONS.map((o) => (
                <button
                  key={o.minutes}
                  type="button"
                  onClick={() => setExpiryMinutes(o.minutes)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    expiryMinutes === o.minutes ? 'bg-brand-600 text-white' : 'bg-brand-900/[0.05] text-brand-900/60 dark:bg-white/5 dark:text-white/60'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Field>
          <Button type="submit" loading={busy} icon={Send} className="w-full">
            Post memo (replaces the current one)
          </Button>
        </form>
      </Panel>

      <div className="lg:col-span-3">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-900/50 dark:text-white/40">Current memo</h3>
        {!latest || expired ? (
          <Panel className="text-sm text-brand-900/50 dark:text-white/40">
            {expired ? 'The last memo has expired.' : 'No memo has been posted yet.'}
          </Panel>
        ) : (
          <Panel className="border-brand-600/20 bg-brand-50/50 dark:bg-brand-900/20">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-brand-900 dark:text-white">{latest.title}</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-900/45 dark:text-white/40">
                <Clock size={12} /> {timeAgo(latest.postedAt)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-brand-900/75 dark:text-white/70">{latest.body}</p>
            <p className="mt-3 text-xs font-semibold text-brand-600">{latest.department || 'All Departments'}</p>
          </Panel>
        )}
      </div>
    </div>
  );
}
