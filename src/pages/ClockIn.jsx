import { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { LogIn, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { timeAgo } from '../lib/format';

export default function ClockIn() {
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const already = !!profile?.isClockedIn;

  async function handleClockIn() {
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', profile.id), {
        isClockedIn: true,
        lastClockInAt: serverTimestamp(),
      });
      toast.success('Clocked in — have a safe shift');
    } catch {
      toast.error('Could not clock in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-white">Clock In</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Start tracking today's shift.</p>
      </div>

      <Panel className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="relative grid h-32 w-32 place-items-center">
          {!already && <span className="absolute inset-0 rounded-full bg-brand-600/20 animate-pulse-ring" />}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleClockIn}
            disabled={already || busy}
            className={`grid h-28 w-28 place-items-center rounded-full text-white shadow-xl transition ${
              already ? 'bg-success shadow-success/30' : 'bg-brand-600 shadow-brand-600/40 hover:bg-brand-700'
            }`}
          >
            {already ? <CheckCircle2 size={40} /> : <LogIn size={36} />}
          </motion.button>
        </div>

        <div>
          <p className="text-lg font-bold text-brand-900 dark:text-white">
            {already ? "You're clocked in" : 'Ready when you are'}
          </p>
          <p className="mt-1 text-sm text-brand-900/50 dark:text-white/40">
            {already
              ? `Since ${timeAgo(profile?.lastClockInAt)}`
              : 'Tap the button to start today\u2019s shift and unlock swap & charge stations.'}
          </p>
        </div>

        {!already && (
          <Button size="lg" onClick={handleClockIn} loading={busy} icon={LogIn}>
            Clock in now
          </Button>
        )}
      </Panel>
    </div>
  );
}
