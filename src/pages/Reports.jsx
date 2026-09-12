import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, CalendarX2, Users2, ClipboardCheck, Activity, FileText, Wallet } from 'lucide-react';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { money, toDate } from '../lib/format';

const TABS = [
  { key: 'general', label: 'General as-is state', icon: Activity },
  { key: 'week', label: "This week's as-is", icon: BarChart3 },
  { key: 'wage', label: 'Wage evaluator', icon: Wallet },
  { key: 'weekly', label: 'Weekly analysis', icon: BarChart3 },
  { key: 'rider', label: 'Rider daily stats', icon: Users2 },
  { key: 'absenteeism', label: 'Absenteeism', icon: CalendarX2 },
  { key: 'hr', label: 'HR report', icon: ClipboardCheck },
  { key: 'docs', label: 'Non-variable docs', icon: FileText },
];

const COLORS = ['#00796B', '#3AA593', '#B26A00', '#C62828', '#0B3B36'];

export default function Reports() {
  const [tab, setTab] = useState('general');
  const users = useFirestoreCollection('users');
  const deviations = useFirestoreCollection('deviations');
  const expenses = useFirestoreCollection('expenses');
  const batteries = useFirestoreCollection('batteries');
  const damages = useFirestoreCollection('damagesReports');

  const loading = users.loading || deviations.loading;

  const riderRows = useMemo(
    () =>
      deviations.data.map((d) => ({
        ...d,
        gross: Number(d.grossIncome ?? d.gross ?? 0),
        net: Number(d.netIncome ?? d.net ?? 0),
        date: toDate(d.date || d.timestamp),
      })),
    [deviations.data]
  );

  const wageTrend = useMemo(
    () =>
      [...riderRows]
        .filter((r) => r.date)
        .sort((a, b) => a.date - b.date)
        .slice(-30)
        .map((r) => ({ label: r.date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }), gross: r.gross, net: r.net })),
    [riderRows]
  );

  const byRider = useMemo(() => {
    const map = {};
    riderRows.forEach((r) => {
      const name = r.userName || r.assignedRider || 'Unassigned';
      map[name] = (map[name] || 0) + r.gross;
    });
    return Object.entries(map)
      .map(([name, gross]) => ({ name, gross }))
      .sort((a, b) => b.gross - a.gross)
      .slice(0, 10);
  }, [riderRows]);

  const notWorkingSunday = users.data.filter((u) => u.isWorkingOnSunday === false).length;
  const activeUsers = users.data.filter((u) => u.isActive ?? true).length;
  const inactiveUsers = users.data.length - activeUsers;
  const onShiftNow = users.data.filter((u) => u.isClockedIn).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Reports</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Operational, financial and people reporting in one place.</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-brand-900/[0.05] text-brand-900/60 hover:bg-brand-900/10 dark:bg-white/5 dark:text-white/60'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          {tab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total team" value={users.data.length} icon={Users2} />
                <StatCard label="On shift now" value={onShiftNow} icon={Activity} tone="success" />
                <StatCard label="Fleet batteries" value={batteries.data.length} tone="brand" />
                <StatCard label="Open damages" value={damages.data.filter((d) => !d.resolved).length} tone="danger" />
              </div>
              <Panel>
                <p className="text-sm text-brand-900/60 dark:text-white/50">
                  A live snapshot of where the business stands right now — headcount, fleet health and open issues — pulled directly
                  from Firestore rather than a point-in-time export.
                </p>
              </Panel>
            </div>
          )}

          {tab === 'week' && (
            <Panel>
              <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Gross income — last 30 entries</h3>
              {wageTrend.length === 0 ? (
                <p className="py-10 text-center text-sm text-brand-900/45">No wage entries logged yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={wageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="gross" fill="#00796B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          )}

          {tab === 'wage' && (
            <Panel>
              <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Gross vs net income over time</h3>
              {wageTrend.length === 0 ? (
                <p className="py-10 text-center text-sm text-brand-900/45">No wage entries logged yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={wageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Line type="monotone" dataKey="gross" stroke="#00796B" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="net" stroke="#B26A00" strokeWidth={2.5} dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Panel>
          )}

          {tab === 'weekly' && (
            <Panel>
              <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Top gross earners</h3>
              {byRider.length === 0 ? (
                <p className="py-10 text-center text-sm text-brand-900/45">No data to rank yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(280, byRider.length * 34)}>
                  <BarChart data={byRider} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="gross" fill="#3AA593" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>
          )}

          {tab === 'rider' && (
            <Panel padded={false} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/[0.06] text-xs uppercase tracking-wide text-brand-900/40 dark:border-white/[0.06]">
                      <th className="px-5 py-3 font-semibold">Rider</th>
                      <th className="px-5 py-3 font-semibold">Rank</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Daily target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.data
                      .filter((u) => u.userRank === 'Rider')
                      .map((u) => (
                        <tr key={u.id} className="border-b border-brand-900/[0.04] last:border-0 dark:border-white/[0.04]">
                          <td className="px-5 py-3.5 font-medium text-brand-900 dark:text-white">{u.userName || '—'}</td>
                          <td className="px-5 py-3.5">{u.userRank}</td>
                          <td className="px-5 py-3.5">
                            <Badge tone={u.isClockedIn ? 'success' : 'neutral'}>{u.isClockedIn ? 'On shift' : 'Off'}</Badge>
                          </td>
                          <td className="px-5 py-3.5 font-mono tabular">{money(u.dailyTarget || 0)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === 'absenteeism' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="Not scheduled on Sundays" value={notWorkingSunday} icon={CalendarX2} tone="warning" />
              <StatCard label="Off shift right now" value={users.data.length - onShiftNow} icon={CalendarX2} />
            </div>
          )}

          {tab === 'hr' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Active accounts" value={activeUsers} tone="success" />
                <StatCard label="Deactivated" value={inactiveUsers} tone="danger" />
                <StatCard label="Total headcount" value={users.data.length} tone="brand" />
              </div>
              <Panel>
                <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Active vs deactivated</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[{ name: 'Active', value: activeUsers }, { name: 'Deactivated', value: inactiveUsers }]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                    >
                      <Cell fill="#2E7D32" />
                      <Cell fill="#C62828" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Panel>
            </div>
          )}

          {tab === 'docs' && (
            <Panel>
              <p className="text-sm text-brand-900/60 dark:text-white/50">
                Non-variable documents — company policies, contracts and templates — belong in a dedicated document store (e.g.
                Firebase Storage or Drive). Wire this tab to that source once it's decided; everything else on this page already
                reads live from Firestore.
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
