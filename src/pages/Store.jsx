import { useMemo, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Warehouse as WarehouseIcon, PackagePlus, PackageCheck, PackageX } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Field, Input } from '../components/ui/Field';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';

const SECTIONS = [
  { key: 'add', label: 'Add stock', icon: PackagePlus },
  { key: 'assign', label: 'Assign', icon: PackageCheck },
  { key: 'disburse', label: 'Disburse', icon: PackageX },
];

export default function Store() {
  const { data, loading } = useFirestoreCollection('store');
  const [section, setSection] = useState('add');
  const [itemName, setItemName] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [busy, setBusy] = useState(false);
  const [assignTo, setAssignTo] = useState({});

  const unassigned = useMemo(() => data.filter((i) => !i.isAssigned), [data]);
  const assigned = useMemo(() => data.filter((i) => i.isAssigned), [data]);

  async function addStock(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'store'), {
        itemName,
        size,
        color,
        isAssigned: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Added to store');
      setItemName('');
      setSize('');
      setColor('');
    } catch {
      toast.error('Could not add stock');
    } finally {
      setBusy(false);
    }
  }

  async function assign(item) {
    const rider = assignTo[item.id];
    if (!rider) return toast.error('Enter a rider name first');
    try {
      await updateDoc(doc(db, 'store', item.id), { isAssigned: true, storeAssignedRider: rider });
      toast.success(`Assigned to ${rider}`);
    } catch {
      toast.error('Could not assign that item');
    }
  }

  async function disburse(item) {
    try {
      await updateDoc(doc(db, 'store', item.id), { isAssigned: false, storeAssignedRider: null });
      toast.success('Item returned to store');
    } catch {
      toast.error('Could not disburse that item');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <WarehouseIcon size={20} className="text-brand-600" />
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Warehouse</h1>
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

      {section === 'add' && (
        <Panel className="max-w-md">
          <form onSubmit={addStock} className="space-y-4">
            <Field label="Item name">
              <Input required value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Size">
                <Input value={size} onChange={(e) => setSize(e.target.value)} />
              </Field>
              <Field label="Color">
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </Field>
            </div>
            <Button type="submit" loading={busy} className="w-full">
              Add to store
            </Button>
          </form>
        </Panel>
      )}

      {section === 'assign' &&
        (loading ? (
          <SkeletonGrid count={3} />
        ) : unassigned.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Nothing to assign" description="All stock is currently out with the team." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {unassigned.map((i) => (
              <Panel key={i.id} className="flex flex-col gap-3">
                <div>
                  <p className="font-bold text-brand-900 dark:text-white">{i.itemName}</p>
                  <p className="text-xs text-brand-900/45 dark:text-white/40">{[i.size, i.color].filter(Boolean).join(' · ') || 'In store'}</p>
                </div>
                <Input
                  placeholder="Rider name"
                  value={assignTo[i.id] || ''}
                  onChange={(e) => setAssignTo((s) => ({ ...s, [i.id]: e.target.value }))}
                />
                <Button size="sm" onClick={() => assign(i)}>
                  Assign
                </Button>
              </Panel>
            ))}
          </div>
        ))}

      {section === 'disburse' &&
        (loading ? (
          <SkeletonGrid count={3} />
        ) : assigned.length === 0 ? (
          <EmptyState icon={PackageX} title="Nothing checked out" />
        ) : (
          <div className="space-y-3">
            {assigned.map((i) => (
              <Panel key={i.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-900 dark:text-white">{i.itemName}</p>
                  <p className="text-xs text-brand-900/45 dark:text-white/40">With {i.storeAssignedRider}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="brand">Checked out</Badge>
                  <Button size="sm" variant="outline" onClick={() => disburse(i)}>
                    Return to store
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        ))}
    </div>
  );
}
