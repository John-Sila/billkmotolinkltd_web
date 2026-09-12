import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { PlusSquare, Send } from 'lucide-react';
import { db } from '../firebase';
import { ROLE_PERMISSIONS } from '../lib/roles';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { Field, Input, Textarea } from '../components/ui/Field';

const RANKS = Object.keys(ROLE_PERMISSIONS);

export default function CreatePoll() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [eligibleVoters, setEligibleVoters] = useState(['Rider']);
  const [busy, setBusy] = useState(false);

  function toggleRank(rank) {
    setEligibleVoters((prev) => (prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]));
  }

  async function submit(e) {
    e.preventDefault();
    if (!deadline) return toast.error('Please select a deadline for the poll');
    if (eligibleVoters.length === 0) return toast.error('Pick at least one rank that can vote');
    setBusy(true);
    try {
      await addDoc(collection(db, 'polls'), {
        title,
        description,
        deadline: new Date(deadline),
        eligibleVoters,
        votedUIDs: [],
        votedUserNames: [],
        createdAt: serverTimestamp(),
      });
      toast.success('Poll published to the team');
      setTitle('');
      setDescription('');
      setDeadline('');
    } catch (err) {
      toast.error(err?.message || 'Could not publish the poll');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-2">
        <PlusSquare size={20} className="text-brand-600" />
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Create a Poll</h1>
      </div>
      <Panel>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Question">
            <Input required placeholder="e.g. Should we shift the shift-change time?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Context (optional)">
            <Textarea placeholder="Add any detail that helps people decide…" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Voting closes">
            <Input required type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </Field>
          <Field label="Who can vote">
            <div className="flex flex-wrap gap-2">
              {RANKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRank(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    eligibleVoters.includes(r) ? 'bg-brand-600 text-white' : 'bg-brand-900/[0.05] text-brand-900/60 dark:bg-white/5 dark:text-white/60'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>
          <Button type="submit" loading={busy} icon={Send} className="w-full">
            Publish poll
          </Button>
        </form>
      </Panel>
    </div>
  );
}
