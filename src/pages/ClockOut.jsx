import { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { LogOut, Flag } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { toDate } from '../lib/format';

function shiftDuration(start) {
  const s = toDate(start);
  if (!s) return null;
  const ms = Date.now() - s.getTime();
  const hrs = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

export default function ClockOut() {
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const clockedIn = !!profile?.isClockedIn;
  const duration = shiftDuration(profile?.lastClockInAt);

  async function handleClockOut() {
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', profile.id), {
        isClockedIn: false,
        lastClockOutAt: serverTimestamp(),
      });
      toast.success('Clocked out — shift saved');
    } catch {
      toast.error('Could not clock out. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-white">Clock Out</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Wrap up today's shift.</p>
      </div>

      <Panel className="flex flex-col items-center gap-6 py-10 text-center">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleClockOut}
          disabled={!clockedIn || busy}
          className={`grid h-28 w-28 place-items-center rounded-full text-white shadow-xl transition ${
            clockedIn ? 'bg-danger shadow-danger/30 hover:brightness-110' : 'bg-brand-900/10 text-brand-900/40 dark:bg-white/10'
          }`}
        >
          {clockedIn ? <LogOut size={36} /> : <Flag size={32} />}
        </motion.button>

        <div>
          <p className="text-lg font-bold text-brand-900 dark:text-white">
            {clockedIn ? `On shift · ${duration || 'just started'}` : 'You are not clocked in'}
          </p>
          <p className="mt-1 text-sm text-brand-900/50 dark:text-white/40">
            {clockedIn ? 'Clocking out ends time tracking and battery access for this session.' : 'Head to Clock In first to start a shift.'}
          </p>
        </div>

        {clockedIn && (
          <Button size="lg" variant="danger" onClick={handleClockOut} loading={busy} icon={LogOut}>
            Clock out
          </Button>
        )}
      </Panel>
    </div>
  );
}
