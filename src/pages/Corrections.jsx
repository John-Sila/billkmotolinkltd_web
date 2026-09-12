import { useMemo } from 'react';
import { orderBy } from 'firebase/firestore';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Wrench, TrendingDown, TrendingUp } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { money, toDate } from '../lib/format';

export default function Corrections() {
  const { data, loading } = useFirestoreCollection('deviations', orderBy('date', 'desc'));

  const rows = useMemo(
    () =>
      data.map((d) => {
        const gross = Number(d.grossIncome ?? d.gross ?? 0);
        const net = Number(d.netIncome ?? d.net ?? 0);
        const diff = Number(d.netGrossDifference ?? d.grossDeviation ?? gross - net);
        return { ...d, gross, net, diff, date: toDate(d.date || d.timestamp) };
      }),
    [data]
  );

  const chartData = useMemo(
    () =>
      [...rows]
        .filter((r) => r.date)
        .sort((a, b) => a.date - b.date)
        .slice(-12)
        .map((r) => ({ label: r.date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }), diff: r.diff })),
    [rows]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Correction</h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Gross vs net wage deviations flagged for review.</p>
        </div>
        <Wrench size={20} className="text-brand-600" />
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Wrench} title="No deviations logged" description="Wage corrections will show up here as they're recorded." />
      ) : (
        <div className="space-y-6">
          {chartData.length > 0 && (
            <Panel>
              <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Net / gross difference — last {chartData.length} entries</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="diff" radius={[6, 6, 0, 0]} fill="#B26A00" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          )}

          <Panel padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-900/[0.06] text-xs uppercase tracking-wide text-brand-900/40 dark:border-white/[0.06] dark:text-white/40">
                    <th className="px-5 py-3 font-semibold">Rider</th>
                    <th className="px-5 py-3 font-semibold">Gross</th>
                    <th className="px-5 py-3 font-semibold">Net</th>
                    <th className="px-5 py-3 font-semibold">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-brand-900/[0.04] last:border-0 dark:border-white/[0.04]">
                      <td className="px-5 py-3.5 font-medium text-brand-900 dark:text-white">{r.userName || r.assignedRider || '—'}</td>
                      <td className="px-5 py-3.5 font-mono tabular">{money(r.gross)}</td>
                      <td className="px-5 py-3.5 font-mono tabular">{money(r.net)}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={r.diff > 0 ? 'danger' : 'success'}>
                          {r.diff > 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                          {money(Math.abs(r.diff))}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
