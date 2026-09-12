import { useMemo, useState } from 'react';
import { addDoc, collection, orderBy, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Calculator, Send } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import { Field, Input, Select } from '../components/ui/Field';
import { money } from '../lib/format';

const TYPES = ['Fuel', 'Maintenance', 'Salaries', 'Rent', 'Utilities', 'Other'];
const COLORS = ['#00796B', '#3AA593', '#B26A00', '#C62828', '#0B3B36', '#9DD1C9'];

export default function CreateBudget() {
  const { data } = useFirestoreCollection('expenses', orderBy('createdAt', 'desc'));
  const [amount, setAmount] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const total = data.reduce((sum, e) => sum + Number(e.amount ?? e.totalAmount ?? 0), 0);
    const pending = data.reduce((sum, e) => sum + Number(e.pendingAmount ?? 0), 0);
    const byType = {};
    data.forEach((e) => {
      const t = e.type || 'Other';
      byType[t] = (byType[t] || 0) + Number(e.amount ?? e.totalAmount ?? 0);
    });
    return { total, pending, chart: Object.entries(byType).map(([name, value]) => ({ name, value })) };
  }, [data]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        amount: Number(amount),
        type,
        description,
        createdAt: serverTimestamp(),
      });
      toast.success('Expense logged');
      setAmount('');
      setDescription('');
    } catch {
      toast.error('Could not save that expense');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Calculator size={20} className="text-brand-600" />
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Create a Budget</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total logged" value={totals.total} format={money} tone="brand" />
        <StatCard label="Pending approval" value={totals.pending} format={money} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2 h-fit">
          <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Log an expense</h3>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Amount (KES)">
              <Input required type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Category">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Note">
              <Input placeholder="What was this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Button type="submit" loading={busy} icon={Send} className="w-full">
              Save expense
            </Button>
          </form>
        </Panel>

        <Panel className="lg:col-span-3">
          <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Spend by category</h3>
          {totals.chart.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-900/45 dark:text-white/40">Nothing logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={totals.chart} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {totals.chart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>
    </div>
  );
}
