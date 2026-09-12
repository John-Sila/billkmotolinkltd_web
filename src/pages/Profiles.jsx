import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { UserCircle, Save } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { roleBadgeTone } from '../lib/roles';
import { initials } from '../lib/format';

export default function Profiles() {
  const { profile } = useAuth();
  const { data } = useFirestoreCollection('users');
  const [name, setName] = useState(profile?.userName || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', profile.id), { userName: name, phoneNumber: phone });
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update your profile');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Profiles</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Your details, and everyone else on the team.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2 h-fit">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-lg font-bold text-white">
              {initials(profile?.userName || profile?.email)}
            </span>
            <div>
              <p className="font-bold text-brand-900 dark:text-white">{profile?.userName || 'Unnamed'}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${roleBadgeTone(profile?.userRank)}`}>
                {profile?.userRank || 'Staff'}
              </span>
            </div>
          </div>
          <form onSubmit={save} className="space-y-4">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Phone number">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Button type="submit" loading={busy} icon={Save} className="w-full">
              Save changes
            </Button>
          </form>
        </Panel>

        <div className="lg:col-span-3">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-900/50 dark:text-white/40">Team directory</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.map((u) => (
              <Panel key={u.id} className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                  {initials(u.userName || u.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-900 dark:text-white">{u.userName || 'Unnamed'}</p>
                  <p className="truncate text-xs text-brand-900/45 dark:text-white/40">{u.phoneNumber || u.email || '—'}</p>
                </div>
                <Badge tone={u.isClockedIn ? 'success' : 'neutral'}>{u.isClockedIn ? 'On shift' : 'Off'}</Badge>
              </Panel>
            ))}
            {data.length === 0 && (
              <div className="col-span-full">
                <UserCircle className="mx-auto mb-2 text-brand-900/20" size={28} />
                <p className="text-center text-sm text-brand-900/45">No profiles found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
