import { useMemo } from 'react';
import { arrayUnion, doc, orderBy, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { toDate } from '../lib/format';

/**
 * Firestore field is `deadline` (a Timestamp) — `deadlineDate` seen in the
 * Flutter source is just a local variable derived from it, never stored.
 * `eligibleVoters` is a list of ranks (e.g. ["Rider","Manager"]), not a
 * headcount, so the real denominator is however many team members hold one
 * of those ranks — we use the loaded team list when it's available and
 * fall back to the vote count itself otherwise.
 */
export default function Polls() {
  const { profile, role } = useAuth();
  const { data, loading } = useFirestoreCollection('polls', orderBy('deadline', 'desc'));
  const canSeeTeam = ['Manager', 'Systems, IT', 'CEO', 'Human Resource'].includes(role);
  const { data: users } = useFirestoreCollection(canSeeTeam ? 'users' : null);

  async function vote(poll) {
    const already = poll.votedUIDs?.includes(profile.id);
    if (already) return toast('You already voted on this poll');
    try {
      await updateDoc(doc(db, 'polls', poll.id), {
        votedUIDs: arrayUnion(profile.id),
        votedUserNames: arrayUnion(profile.userName || profile.id),
      });
      toast.success('Vote recorded');
    } catch {
      toast.error('Could not record your vote');
    }
  }

  const withMeta = useMemo(
    () =>
      data.map((p) => {
        const voted = p.votedUserNames?.length || p.votedUIDs?.length || 0;
        const eligibleRanks = p.eligibleVoters || [];
        const eligibleCount = users?.length ? users.filter((u) => eligibleRanks.includes(u.userRank)).length : 0;
        const eligible = Math.max(eligibleCount, voted, 1);
        const deadline = toDate(p.deadline);
        const closed = deadline ? deadline < new Date() : false;
        const canIVote = !role || eligibleRanks.length === 0 || eligibleRanks.includes(role);
        const iVoted = p.votedUIDs?.includes(profile?.id);
        return { ...p, voted, eligible, pct: Math.min(100, Math.round((voted / eligible) * 100)), deadline, closed, iVoted, canIVote };
      }),
    [data, profile, role, users]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Polls</h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Have your say on what's being decided company-wide.</p>
        </div>
        <Vote size={20} className="text-brand-600" />
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : withMeta.length === 0 ? (
        <EmptyState icon={Vote} title="No polls right now" description="New polls from management will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {withMeta.map((p) => (
            <Panel key={p.id}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-900 dark:text-white">{p.title || 'Untitled poll'}</p>
                  {p.description && <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">{p.description}</p>}
                </div>
                <Badge tone={p.closed ? 'neutral' : 'brand'}>{p.closed ? 'Closed' : 'Open'}</Badge>
              </div>

              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs text-brand-900/50 dark:text-white/40">
                  <span>{p.voted} voted{p.eligible > p.voted ? ` of ~${p.eligible} eligible` : ''}</span>
                  <span>{p.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-900/[0.06] dark:bg-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} className="h-full rounded-full bg-brand-600" />
                </div>
              </div>

              {p.iVoted ? (
                <span className="flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 size={16} /> You've voted
                </span>
              ) : p.closed ? (
                <span className="text-sm text-brand-900/45 dark:text-white/40">Voting has closed</span>
              ) : !p.canIVote ? (
                <span className="text-sm text-brand-900/45 dark:text-white/40">Only {p.eligibleVoters?.join(', ')} can vote on this one</span>
              ) : (
                <Button size="sm" icon={Vote} onClick={() => vote(p)}>
                  Cast your vote
                </Button>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
