import { useMemo, useState } from 'react';
import { addDoc, arrayUnion, collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Bike, BatteryFull, MapPin, Plus } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Field, Input, Select } from '../components/ui/Field';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';

const BIKE_FORMAT = /^[A-Z]{4} [0-9]{3}[A-Z]$/;
const SECTIONS = [
  { key: 'batteries', label: 'Batteries', icon: BatteryFull },
  { key: 'bikes', label: 'Bikes', icon: Bike },
  { key: 'destinations', label: 'Destinations', icon: MapPin },
];

/**
 * Manages the same three things the Flutter Asset Manager does: the
 * `batteries` collection, and the `bikes` map + `destinations` array that
 * both live inside the single `general/general_variables` document. There
 * is no separate `bikes` or `destinations` collection.
 */
export default function AssetManager() {
  const [section, setSection] = useState('batteries');
  const batteries = useFirestoreCollection('batteries');
  const general = useFirestoreCollection('general');
  const generalDoc = useMemo(() => general.data.find((d) => d.id === 'general_variables'), [general.data]);
  const bikes = useMemo(() => Object.entries(generalDoc?.bikes || {}), [generalDoc]);
  const destinations = useMemo(() => generalDoc?.destinations || [], [generalDoc]);

  const [batteryName, setBatteryName] = useState('');
  const [batteryDestination, setBatteryDestination] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [busy, setBusy] = useState(false);

  async function addBattery(e) {
    e.preventDefault();
    if (!batteryName.trim() || !batteryDestination) return toast.error('Battery name and location are required');
    setBusy(true);
    try {
      const lower = batteryName.trim().toLowerCase();
      const dupes = await getDocs(query(collection(db, 'batteries'), where('batteryNameLower', '==', lower), limit(1)));
      if (!dupes.empty) {
        toast.error('A battery with a similar name already exists');
        return;
      }
      await addDoc(collection(db, 'batteries'), {
        batteryName: batteryName.trim(),
        batteryNameLower: lower,
        batteryLocation: batteryDestination,
        assignedBike: 'None',
        assignedRider: 'None',
        offTime: new Date(),
        traces: { [new Date().toISOString().split('T')[0]]: { entries: ['Battery was added'], dateEdited: new Date() } },
      });
      toast.success('Battery added');
      setBatteryName('');
      setBatteryDestination('');
    } catch (err) {
      toast.error(err?.message || 'Could not add that battery');
    } finally {
      setBusy(false);
    }
  }

  async function addBike(e) {
    e.preventDefault();
    const name = bikeName.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!BIKE_FORMAT.test(name)) {
      return toast.error('Use the format "KMFF 222G" — 4 letters, space, 3 digits + 1 letter');
    }
    if (generalDoc?.bikes?.[name]) return toast.error('That bike already exists');
    setBusy(true);
    try {
      await updateDoc(doc(db, 'general', 'general_variables'), {
        [`bikes.${name}`]: { assignedRider: 'None', isAssigned: false },
      });
      toast.success('Bike added');
      setBikeName('');
    } catch (err) {
      toast.error(err?.message || 'Could not add that bike');
    } finally {
      setBusy(false);
    }
  }

  async function addDestination(e) {
    e.preventDefault();
    const name = destinationName.trim();
    if (!name) return;
    if (destinations.includes(name)) return toast.error('That destination already exists');
    setBusy(true);
    try {
      await updateDoc(doc(db, 'general', 'general_variables'), { destinations: arrayUnion(name) });
      toast.success('Destination added');
      setDestinationName('');
    } catch (err) {
      toast.error(err?.message || 'Could not add that destination');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Asset Manager</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Batteries, bikes and drop-off locations across the fleet.</p>
      </div>

      <div className="mb-6 flex gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              section === s.key ? 'bg-brand-600 text-white' : 'bg-brand-900/[0.05] text-brand-900/60 dark:bg-white/5 dark:text-white/60'
            }`}
          >
            <s.icon size={13} /> {s.label}
          </button>
        ))}
      </div>

      {section === 'batteries' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Panel className="lg:col-span-2 h-fit">
            <form onSubmit={addBattery} className="space-y-4">
              <Field label="Battery name">
                <Input required value={batteryName} onChange={(e) => setBatteryName(e.target.value)} />
              </Field>
              <Field label="Location">
                <Select required value={batteryDestination} onChange={(e) => setBatteryDestination(e.target.value)}>
                  <option value="">Select a location…</option>
                  {destinations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button type="submit" loading={busy} icon={Plus} className="w-full">
                Add battery
              </Button>
            </form>
          </Panel>
          <div className="lg:col-span-3">
            {batteries.loading ? (
              <SkeletonGrid count={3} />
            ) : batteries.data.length === 0 ? (
              <EmptyState icon={BatteryFull} title="No batteries yet" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {batteries.data.map((b) => (
                  <Panel key={b.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-brand-900 dark:text-white">{b.batteryName}</p>
                      <p className="text-xs text-brand-900/45 dark:text-white/40">{b.batteryLocation}</p>
                    </div>
                    <Badge tone={b.assignedRider && b.assignedRider !== 'None' ? 'brand' : 'neutral'}>
                      {b.assignedRider && b.assignedRider !== 'None' ? b.assignedRider : 'Unassigned'}
                    </Badge>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {section === 'bikes' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Panel className="lg:col-span-2 h-fit">
            <form onSubmit={addBike} className="space-y-4">
              <Field label="Bike plate" hint='Format: "KMFF 222G"'>
                <Input required placeholder="KMFF 222G" value={bikeName} onChange={(e) => setBikeName(e.target.value)} />
              </Field>
              <Button type="submit" loading={busy} icon={Plus} className="w-full">
                Add bike
              </Button>
            </form>
          </Panel>
          <div className="lg:col-span-3">
            {general.loading ? (
              <SkeletonGrid count={3} />
            ) : bikes.length === 0 ? (
              <EmptyState icon={Bike} title="No bikes registered" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {bikes.map(([name, info]) => (
                  <Panel key={name} className="flex items-center justify-between">
                    <p className="font-mono font-semibold text-brand-900 dark:text-white">{name}</p>
                    <Badge tone={info.isAssigned ? 'brand' : 'neutral'}>{info.isAssigned ? info.assignedRider : 'In store'}</Badge>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {section === 'destinations' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Panel className="lg:col-span-2 h-fit">
            <form onSubmit={addDestination} className="space-y-4">
              <Field label="Destination name">
                <Input required value={destinationName} onChange={(e) => setDestinationName(e.target.value)} />
              </Field>
              <Button type="submit" loading={busy} icon={Plus} className="w-full">
                Add destination
              </Button>
            </form>
          </Panel>
          <div className="lg:col-span-3 flex flex-wrap gap-2">
            {general.loading ? (
              <SkeletonGrid count={2} />
            ) : destinations.length === 0 ? (
              <EmptyState icon={MapPin} title="No destinations yet" />
            ) : (
              destinations.map((d) => (
                <Badge key={d} tone="brand" className="!px-3 !py-1.5 !text-sm">
                  {d}
                </Badge>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
