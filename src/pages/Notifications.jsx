import { useMemo } from 'react';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { Bell, BellRing } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Panel from '../components/ui/Panel';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo, toDate } from '../lib/format';

/**
 * Personal notifications live as a map field directly on the user's own
 * doc — `users/{uid}.notifications.{id} = { message, time, isRead }` — not
 * in a subcollection. `profile` already streams that doc live via
 * AuthContext, so this page needs no separate Firestore query at all.
 */
export default function Notifications() {
  const { profile } = useAuth();

  const items = useMemo(() => {
    const map = profile?.notifications || {};
    return Object.entries(map)
      .map(([id, n]) => ({ id, ...n, dateObj: toDate(n.time) }))
      .sort((a, b) => (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0));
  }, [profile]);

  async function markRead(n) {
    if (n.isRead || !profile?.id) return;
    try {
      await updateDoc(doc(db, 'users', profile.id), {
        [`notifications.${n.id}.isRead`]: true,
        numberOfNotifications: increment(-1),
      });
    } catch {
      // Non-critical — leave it unread rather than interrupt the user.
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <BellRing size={20} className="text-brand-600" />
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Notifications</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will land here in real time." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button key={n.id} onClick={() => markRead(n)} className="block w-full text-left">
              <Panel className={`flex items-start gap-3 ${!n.isRead ? 'border-brand-600/30 bg-brand-50/50 dark:bg-brand-900/20' : ''}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.isRead ? 'bg-brand-600' : 'bg-transparent'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-brand-900 dark:text-white/90">{n.message}</p>
                  <p className="mt-1 text-xs text-brand-900/40 dark:text-white/35">{timeAgo(n.dateObj)}</p>
                </div>
              </Panel>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
