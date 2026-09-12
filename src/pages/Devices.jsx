import { useMemo, useState } from 'react';
import { collection, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Smartphone, Wrench, BatteryMedium, Wifi, MonitorSmartphone } from 'lucide-react';
import { db } from '../firebase';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/Skeleton';

/**
 * Reads `users` where `device_info` is set — this is the handset telemetry
 * each rider's app reports on login (platform, model, battery, network,
 * screen size...), same source as the Flutter app's Devices page. There is
 * no separate `devices` collection in Firestore.
 */
export default function Devices() {
  const { data, loading } = useFirestoreCollection('users', where('device_info', '!=', null));
  const [repairing, setRepairing] = useState(false);

  const withDevice = useMemo(() => data.filter((u) => u.device_info), [data]);

  async function repairUnclockedAssets() {
    setRepairing(true);
    try {
      const unclocked = await getDocs(query(collection(db, 'users'), where('isClockedIn', '==', false)));
      const batch = writeBatch(db);
      let repaired = 0;

      const generalRef = doc(db, 'general', 'general_variables');
      let bikesPatch = {};

      for (const userDoc of unclocked.docs) {
        const userName = userDoc.data()?.userName;
        if (!userName) continue;

        // Batteries left booked/assigned to a rider who's already clocked out
        const staleBatteries = await getDocs(query(collection(db, 'batteries'), where('batteryRider', '==', userName)));
        staleBatteries.forEach((b) => {
          batch.update(doc(db, 'batteries', b.id), {
            assignedRider: 'None',
            assignedBike: 'None',
            batteryLocation: 'Manual',
            offTime: new Date(),
          });
          repaired += 1;
        });
      }

      // Bikes left assigned in general/general_variables to a now-unclocked rider
      const generalSnap = await getDocs(query(collection(db, 'general')));
      const generalDoc = generalSnap.docs.find((d) => d.id === 'general_variables');
      const bikes = generalDoc?.data()?.bikes || {};
      const unclockedNames = new Set(unclocked.docs.map((d) => d.data()?.userName).filter(Boolean));
      Object.entries(bikes).forEach(([bikeId, bike]) => {
        if (bike?.assignedRider && unclockedNames.has(bike.assignedRider)) {
          bikesPatch[`bikes.${bikeId}.assignedRider`] = 'None';
          bikesPatch[`bikes.${bikeId}.isAssigned`] = false;
          repaired += 1;
        }
      });
      if (Object.keys(bikesPatch).length > 0) {
        batch.update(generalRef, bikesPatch);
      }

      await batch.commit();
      toast.success(`Repaired ${repaired} asset${repaired === 1 ? '' : 's'} for unclocked riders`);
    } catch (err) {
      toast.error(err?.message || 'Could not repair assets');
    } finally {
      setRepairing(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Devices</h1>
          <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">Handset telemetry reported by the app on each device.</p>
        </div>
        <Button variant="outline" icon={Wrench} loading={repairing} onClick={repairUnclockedAssets}>
          Repair stuck assets
        </Button>
      </div>

      {loading ? (
        <SkeletonGrid count={3} />
      ) : withDevice.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No device data yet"
          description="Once a rider signs in from the mobile app, their device details will show up here automatically."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {withDevice.map((u) => {
            const d = u.device_info || {};
            const battery = typeof d.batteryLevel === 'number' ? Math.round(d.batteryLevel <= 1 ? d.batteryLevel * 100 : d.batteryLevel) : null;
            return (
              <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Panel className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-white/5">
                        <MonitorSmartphone size={16} />
                      </span>
                      <div>
                        <p className="font-bold text-brand-900 dark:text-white">{u.userName || 'Unnamed'}</p>
                        <p className="text-xs text-brand-900/45 dark:text-white/40">{d.brand || d.manufacturer || d.platform || 'Unknown device'}</p>
                      </div>
                    </div>
                    {d.isPhysicalDevice === false && <Badge tone="warning">Emulator</Badge>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <InfoRow label="Model" value={d.model} />
                    <InfoRow label="OS" value={d.osVersion ? `Android ${d.osVersion}` : d.platform} />
                    <InfoRow label="Network" value={d.networkType} icon={Wifi} />
                    <InfoRow label="Battery" value={battery != null ? `${battery}%` : null} icon={BatteryMedium} />
                  </div>
                </Panel>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl bg-brand-900/[0.03] px-2.5 py-2 dark:bg-white/5">
      <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-brand-900/40 dark:text-white/35">
        {Icon && <Icon size={10} />} {label}
      </p>
      <p className="truncate font-mono text-[11px] font-semibold text-brand-900 dark:text-white/80">{value || '—'}</p>
    </div>
  );
}
