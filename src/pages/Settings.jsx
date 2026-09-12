import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, HelpCircle, FileText, CalendarDays, Trash2, User, Save } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useTheme } from '../context/ThemeContext';
import { toDate } from '../lib/format';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import EmptyState from '../components/ui/EmptyState';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'calendar', label: 'Calendar of events', icon: CalendarDays },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'terms', label: 'Terms & Conditions', icon: FileText },
  { key: 'clear', label: 'Clear app data', icon: Trash2 },
];

const FAQ = [
  { q: 'How do I clock in?', a: 'Open Clock In from the sidebar and tap the big button. It unlocks battery swap and charge stations for the shift.' },
  { q: 'My battery shows the wrong charge level', a: 'Battery levels sync live from Firestore. Pull-to-refresh isn\u2019t needed — if it looks stale, check the Live/Cached indicator in the top bar.' },
  { q: 'Who can change my rank?', a: 'Only Managers, CEO and Systems/IT accounts can change ranks, from User Manager.' },
];

export default function Settings() {
  const [tab, setTab] = useState('profile');
  const { profile } = useAuth();
  const { theme, toggle } = useTheme();
  const events = useFirestoreCollection(tab === 'calendar' ? 'companyEvents' : null);
  const [name, setName] = useState(profile?.userName || '');
  const [busy, setBusy] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateDoc(doc(db, 'users', profile.id), { userName: name });
      toast.success('Saved');
    } catch {
      toast.error('Could not save');
    } finally {
      setBusy(false);
    }
  }

  function clearData() {
    localStorage.removeItem('billk-theme');
    toast.success('Local preferences cleared. Sign out and back in to fully reset the cache.');
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon size={20} className="text-brand-600" />
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Settings</h1>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-brand-900/[0.05] text-brand-900/60 dark:bg-white/5 dark:text-white/60'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Panel className="max-w-md">
          <form onSubmit={saveProfile} className="space-y-4">
            <Field label="Full name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className="flex items-center justify-between rounded-xl bg-brand-900/[0.03] px-4 py-3 dark:bg-white/5">
              <span className="text-sm font-semibold text-brand-900 dark:text-white">Dark mode</span>
              <button
                onClick={toggle}
                type="button"
                className={`h-6 w-11 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-600' : 'bg-brand-900/15'}`}
              >
                <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-[22px]' : ''}`} />
              </button>
            </div>
            <Button type="submit" loading={busy} icon={Save} className="w-full">
              Save profile
            </Button>
          </form>
        </Panel>
      )}

      {tab === 'calendar' && (
        events.data.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events scheduled" description="Events added from Add to Calendar will show up here." />
        ) : (
          <div className="space-y-3">
            {events.data.map((e) => (
              <Panel key={e.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-900 dark:text-white">{e.title}</p>
                  <p className="text-xs text-brand-900/45 dark:text-white/40">{e.location}</p>
                </div>
                <span className="text-sm font-medium text-brand-600">
                  {toDate(e.event_time)?.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) || '—'}
                </span>
              </Panel>
            ))}
          </div>
        )
      )}

      {tab === 'faq' && (
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <Panel key={i}>
              <p className="font-semibold text-brand-900 dark:text-white">{f.q}</p>
              <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">{f.a}</p>
            </Panel>
          ))}
        </div>
      )}

      {tab === 'terms' && (
        <Panel className="prose prose-sm max-w-none text-brand-900/70 dark:text-white/60">
          <p>
            By using the Billk Motolink Ltd console you agree to keep account credentials confidential, report equipment damage
            promptly, and use fleet assets solely for company operations. Full terms are issued separately by HR at onboarding.
          </p>
        </Panel>
      )}

      {tab === 'clear' && (
        <Panel className="max-w-md">
          <p className="mb-4 text-sm text-brand-900/60 dark:text-white/50">
            Clears locally cached preferences on this device. Your account data in Firestore is never affected.
          </p>
          <Button variant="danger" icon={Trash2} onClick={clearData}>
            Clear local app data
          </Button>
        </Panel>
      )}
    </div>
  );
}
