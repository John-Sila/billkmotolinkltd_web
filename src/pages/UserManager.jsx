import { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Search, Users, Power } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { ROLE_PERMISSIONS, roleBadgeTone } from '../lib/roles';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { initials } from '../lib/format';

const RANKS = Object.keys(ROLE_PERMISSIONS);

export default function UserManager() {
  const { data, loading } = useFirestoreCollection('users');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((u) => (u.userName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [data, search]);

  async function setRank(u, rank) {
    try {
      await updateDoc(doc(db, 'users', u.id), { userRank: rank });
      toast.success(`${u.userName || 'User'} is now ${rank}`);
    } catch {
      toast.error('Could not update rank');
    }
  }

  async function toggleActive(u) {
    try {
      await updateDoc(doc(db, 'users', u.id), { isActive: !(u.isActive ?? true) });
      toast.success(u.isActive ?? true ? 'Account deactivated' : 'Account reactivated');
    } catch {
      toast.error('Could not update that account');
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">User Manager</h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Assign ranks and control who can sign in.</p>
        </div>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-900/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people"
            className="w-52 rounded-xl border border-brand-900/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-600 dark:border-white/10 dark:bg-white/5"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No matching users" />
      ) : (
        <Panel padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/[0.06] text-xs uppercase tracking-wide text-brand-900/40 dark:border-white/[0.06] dark:text-white/40">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Rank</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const active = u.isActive ?? true;
                  return (
                    <tr key={u.id} className="border-b border-brand-900/[0.04] last:border-0 dark:border-white/[0.04]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                            {initials(u.userName || u.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-brand-900 dark:text-white">{u.userName || 'Unnamed'}</p>
                            <p className="truncate text-xs text-brand-900/45 dark:text-white/40">{u.email || u.phoneNumber || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={u.userRank || 'Staff'}
                          onChange={(e) => setRank(u, e.target.value)}
                          className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-bold ${roleBadgeTone(u.userRank)}`}
                        >
                          {RANKS.map((r) => (
                            <option key={r} value={r} className="text-brand-900">
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={active ? 'success' : 'danger'}>{active ? 'Active' : 'Deactivated'}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => toggleActive(u)}
                          title={active ? 'Deactivate' : 'Reactivate'}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                            active ? 'text-danger hover:bg-danger-bg' : 'text-success hover:bg-success-bg'
                          }`}
                        >
                          <Power size={13} /> {active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
