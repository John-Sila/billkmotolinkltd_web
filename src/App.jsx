import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import { RequireAuth, RequireRank } from './components/layout/Guards';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClockIn from './pages/ClockIn';
import ClockOut from './pages/ClockOut';
import SwapBatteries from './pages/SwapBatteries';
import ChargeBatteries from './pages/ChargeBatteries';
import Batteries from './pages/Batteries';
import ReportDamages from './pages/ReportDamages';
import QueuedDamages from './pages/QueuedDamages';
import Corrections from './pages/Corrections';
import Polls from './pages/Polls';
import CreatePoll from './pages/CreatePoll';
import CreateBudget from './pages/CreateBudget';
import Requirements from './pages/Requirements';
import AssetManager from './pages/AssetManager';
import UserManager from './pages/UserManager';
import Profiles from './pages/Profiles';
import ActivityScheduler from './pages/ActivityScheduler';
import AddToCalendar from './pages/AddToCalendar';
import Reports from './pages/Reports';
import Memo from './pages/Memo';
import Store from './pages/Store';
import Devices from './pages/Devices';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// path -> element, guarded by rank exactly like the Flutter drawer's
// `_rolePermissions[role]` list (see lib/roles.js + lib/nav.js).
const ROUTES = [
  ['/', <Dashboard />],
  ['/clock-in', <ClockIn />],
  ['/swap-batteries', <SwapBatteries />],
  ['/charge-batteries', <ChargeBatteries />],
  ['/report-damages', <ReportDamages />],
  ['/clock-out', <ClockOut />],
  ['/corrections', <Corrections />],
  ['/batteries', <Batteries />],
  ['/polls', <Polls />],
  ['/create-budget', <CreateBudget />],
  ['/requirements', <Requirements />],
  ['/asset-manager', <AssetManager />],
  ['/user-manager', <UserManager />],
  ['/profiles', <Profiles />],
  ['/create-poll', <CreatePoll />],
  ['/activity-scheduler', <ActivityScheduler />],
  ['/add-to-calendar', <AddToCalendar />],
  ['/reports', <Reports />],
  ['/queued-damages', <QueuedDamages />],
  ['/memo', <Memo />],
  ['/warehouse', <Store />],
  ['/devices', <Devices />],
  ['/settings', <Settings />],
];

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '13px', fontWeight: 600 },
              success: { iconTheme: { primary: '#00796B', secondary: '#fff' } },
              error: { iconTheme: { primary: '#C62828', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              {ROUTES.map(([path, element]) => (
                <Route key={path} path={path} element={<RequireRank path={path}>{element}</RequireRank>} />
              ))}
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
