import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { orderBy, limit as fbLimit } from 'firebase/firestore';
import {
  Users,
  BatteryFull,
  ShieldAlert,
  Wallet,
  Vote as VoteIcon,
  Bike,
  LogIn,
  MessageSquareText,
  CalendarClock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { money, toDate } from '../lib/format';

const COLORS = ['#00796B', '#3AA593', '#B26A00', '#C62828', '#0B3B36', '#9DD1C9'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { profile, role } = useAuth();

  const isRider = role === 'Rider';
  const isStaffOnly = role === 'Staff';
  const canFleetOps = ['Manager', 'Systems, IT', 'CEO'].includes(role);
  const canHR = ['Human Resource', 'Manager', 'Systems, IT', 'CEO'].includes(role);
  const canStore = ['Store Keeper', 'Technician', 'Manager', 'Systems, IT', 'CEO'].includes(role);

  const users = useFirestoreCollection(canFleetOps || canHR ? 'users' : null);
  const batteries = useFirestoreCollection(canFleetOps || canStore || isRider ? 'batteries' : null);
  const damages = useFirestoreCollection(canFleetOps || canStore ? 'damagesReports' : null);
  const deviations = useFirestoreCollection(canFleetOps || canHR ? 'deviations' : null);
  const expenses = useFirestoreCollection(canFleetOps || canHR ? 'expenses' : null);
  const polls = useFirestoreCollection(!isStaffOnly ? 'polls' : null, orderBy('deadline', 'desc'), fbLimit(5));
  // The Flutter dashboard's own three reads: upcoming events, the single
  // broadcast memo doc, and general_variables (commission %, app version).
  const events = useFirestoreCollection('events', orderBy('event_time', 'asc'), fbLimit(3));
  const memo = useFirestoreCollection('memo');
  const general = useFirestoreCollection(canFleetOps ? 'general' : null);

  const upcomingEvents = useMemo(
    () => (events.data || []).filter((e) => !toDate(e.event_time) || toDate(e.event_time) > new Date()),
    [events.data]
  );
  const latestMemo = useMemo(() => {
    const m = (memo.data || []).find((d) => d.id === 'latest');
    if (!m) return null;
    const expiresAt = toDate(m.expiresAt);
    return expiresAt && expiresAt < new Date() ? null : m;
  }, [memo.data]);
  const generalVars = useMemo(() => (general.data || []).find((d) => d.id === 'general_variables'), [general.data]);

  const loadingAny = users.loading || batteries.loading;

  const riderStats = useMemo(() => {
    const all = users.data || [];
    const online = all.filter((u) => u.isClockedIn).length;
    const byRank = {};
    all.forEach((u) => {
      const r = u.userRank || 'Unranked';
      byRank[r] = (byRank[r] || 0) + 1;
    });
    return { total: all.length, online, byRank: Object.entries(byRank).map(([name, value]) => ({ name, value })) };
  }, [users.data]);

  const batteryStats = useMemo(() => {
    const all = batteries.data || [];
    const counts = { Charging: 0, Booked: 0, Assigned: 0, Idle: 0 };
    all.forEach((b) => {
      if (b.isCharging) counts.Charging += 1;
      else if (b.isBooked) counts.Booked += 1;
      else if (b.isAssigned) counts.Assigned += 1;
      else counts.Idle += 1;
    });
    return {
      total: all.length,
      chart: Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value })),
    };
  }, [batteries.data]);

  const damageStats = useMemo(() => {
    const all = damages.data || [];
    const open = all.filter((d) => !d.resolved).length;
    return { total: all.length, open, resolved: all.length - open };
  }, [damages.data]);

  const wageTrend = useMemo(() => {
    const all = deviations.data || [];
    return all
      .map((d) => ({
        date: toDate(d.date || d.timestamp || d.time),
        gross: Number(d.grossIncome ?? d.gross ?? 0),
        net: Number(d.netIncome ?? d.net ?? 0),
      }))
      .filter((d) => d.date)
      .sort((a, b) => a.date - b.date)
      .slice(-14)
      .map((d) => ({ ...d, label: d.date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }) }));
  }, [deviations.data]);

  const expenseByType = useMemo(() => {
    const all = expenses.data || [];
    const byType = {};
    all.forEach((e) => {
      const t = e.type || e.description || 'Other';
      byType[t] = (byType[t] || 0) + Number(e.amount ?? e.totalAmount ?? 0);
    });
    return Object.entries(byType).map(([name, amount]) => ({ name, amount }));
  }, [expenses.data]);

  const myBattery = useMemo(() => {
    if (!isRider) return null;
    return (batteries.data || []).find((b) => b.assignedRider === profile?.id || b.bookedBy === profile?.id);
  }, [batteries.data, isRider, profile]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">{greeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">
            {profile?.userName || 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">
            Signed in as <span className="font-semibold">{role}</span> · here's what's moving right now.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={profile?.isClockedIn ? 'success' : 'neutral'}>
            {profile?.isClockedIn ? 'Clocked in' : 'Not clocked in'}
          </Badge>
        </div>
      </div>

      {(latestMemo || upcomingEvents.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {latestMemo && (
            <Panel className="border-brand-600/20 bg-brand-50/50 dark:bg-brand-900/20">
              <div className="mb-2 flex items-center gap-2 text-brand-600">
                <MessageSquareText size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Company memo</span>
              </div>
              <p className="font-bold text-brand-900 dark:text-white">{latestMemo.title}</p>
              <p className="mt-1 text-sm text-brand-900/70 dark:text-white/60">{latestMemo.body}</p>
            </Panel>
          )}
          {upcomingEvents.length > 0 && (
            <Panel>
              <div className="mb-2 flex items-center gap-2 text-brand-600">
                <CalendarClock size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Upcoming events</span>
              </div>
              <div className="space-y-2">
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-brand-900 dark:text-white">{e.title}</span>
                    <span className="text-xs text-brand-900/45 dark:text-white/40">
                      {toDate(e.event_time)?.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }) || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}

      {canFleetOps && generalVars && (
        <Panel className="mb-6 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/45 dark:text-white/40">Commission rate</p>
            <p className="font-mono text-xl font-bold tabular text-brand-900 dark:text-white">{generalVars.commissionPercentage ?? 0}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/45 dark:text-white/40">Registered bikes</p>
            <p className="font-mono text-xl font-bold tabular text-brand-900 dark:text-white">{Object.keys(generalVars.bikes || {}).length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/45 dark:text-white/40">Drop-off points</p>
            <p className="font-mono text-xl font-bold tabular text-brand-900 dark:text-white">{(generalVars.destinations || []).length}</p>
          </div>
        </Panel>
      )}

      {/* ---- Rider-focused personal snapshot ---- */}
      {isRider && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Wallet balance" value={Number(profile?.currentInAppBalance) || 0} format={money} icon={Wallet} tone="brand" />
          <StatCard label="Daily target" value={Number(profile?.dailyTarget) || 0} format={money} icon={Bike} tone="warning" />
          <StatCard
            label="My battery"
            value={myBattery ? `${myBattery.batteryLevel ?? '—'}%` : 'None assigned'}
            icon={BatteryFull}
            tone="success"
          />
          <StatCard label="Status" value={profile?.isClockedIn ? 'On shift' : 'Off shift'} icon={LogIn} tone={profile?.isClockedIn ? 'success' : 'neutral'} />
        </div>
      )}

      {/* ---- Staff-only minimal view ---- */}
      {isStaffOnly && (
        <Panel className="text-sm text-brand-900/60 dark:text-white/50">
          Your role has access to the dashboard only. Reach out to your manager if you believe you should see more.
        </Panel>
      )}

      {loadingAny && !isStaffOnly && <SkeletonGrid />}

      {/* ---- Fleet + HR overview (Manager / Systems IT / CEO / HR) ---- */}
      {(canFleetOps || canHR) && !users.loading && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Team members" value={riderStats.total} icon={Users} tone="brand" hint={`${riderStats.online} clocked in now`} />
            {(canFleetOps || canStore) && (
              <StatCard label="Fleet batteries" value={batteryStats.total} icon={BatteryFull} tone="success" />
            )}
            {(canFleetOps || canStore) && (
              <StatCard label="Open damage reports" value={damageStats.open} icon={ShieldAlert} tone={damageStats.open > 0 ? 'danger' : 'success'} />
            )}
            {canFleetOps && wageTrend.length > 0 && (
              <StatCard
                label="Latest gross income"
                value={wageTrend[wageTrend.length - 1]?.gross || 0}
                format={money}
                icon={Wallet}
                tone="warning"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {(canFleetOps || canStore) && batteryStats.chart.length > 0 && (
              <Panel className="xl:col-span-1">
                <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Battery fleet status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={batteryStats.chart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {batteryStats.chart.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={28} />
                  </PieChart>
                </ResponsiveContainer>
              </Panel>
            )}

            {canHR && riderStats.byRank.length > 0 && (
              <Panel className="xl:col-span-1">
                <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Headcount by rank</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={riderStats.byRank}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00796B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            )}

            {canFleetOps && wageTrend.length > 0 && (
              <Panel className="xl:col-span-1">
                <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Gross vs net income</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={wageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Line type="monotone" dataKey="gross" stroke="#00796B" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="net" stroke="#B26A00" strokeWidth={2.5} dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </Panel>
            )}

            {canHR && expenseByType.length > 0 && (
              <Panel className="xl:col-span-1">
                <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Expenses by type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={expenseByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,59,54,0.08)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="amount" fill="#3AA593" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            )}

            {(canFleetOps || canStore) && (
              <Panel className="xl:col-span-1">
                <h3 className="mb-4 font-bold text-brand-900 dark:text-white">Damage reports</h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={160}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Open', value: damageStats.open },
                          { name: 'Resolved', value: damageStats.resolved },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                      >
                        <Cell fill="#C62828" />
                        <Cell fill="#2E7D32" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-danger" /> {damageStats.open} open</p>
                    <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" /> {damageStats.resolved} resolved</p>
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </>
      )}

      {/* ---- Active polls, visible to every role that isn't Staff-only ---- */}
      {!isStaffOnly && polls.data?.length > 0 && (
        <Panel className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-brand-900 dark:text-white">Active polls</h3>
            <VoteIcon size={18} className="text-brand-600" />
          </div>
          <div className="space-y-3">
            {polls.data.slice(0, 4).map((p) => {
              const voted = p.votedUserNames?.length || p.votedUIDs?.length || 0;
              const eligible = p.eligibleVoters?.length || Math.max(voted, 1);
              const pct = Math.min(100, Math.round((voted / eligible) * 100));
              return (
                <div key={p.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-brand-900 dark:text-white">{p.title || 'Untitled poll'}</span>
                    <span className="text-brand-900/50 dark:text-white/40">{voted}/{eligible} voted</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-900/[0.06] dark:bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-brand-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
