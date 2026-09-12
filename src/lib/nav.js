import {
  LayoutDashboard,
  LogIn,
  Repeat,
  BatteryCharging,
  ShieldAlert,
  LogOut,
  Wrench,
  BatteryFull,
  Vote,
  Calculator,
  ClipboardList,
  Bike,
  Users,
  UserCircle,
  PlusSquare,
  Timer,
  CalendarPlus,
  BarChart3,
  ListTodo,
  MessageSquareText,
  Warehouse,
  Smartphone,
  Settings as SettingsIcon,
} from 'lucide-react';

// Same order, same indices, same titles as `_pages` / `_titles` in the
// Flutter app's main.dart — index 0 is Dashboard, 22 is Settings, etc.
// `path` is this console's route for that page.
export const NAV_ITEMS = [
  { index: 0, title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { index: 1, title: 'Clock In', path: '/clock-in', icon: LogIn },
  { index: 2, title: 'Swap Batteries', path: '/swap-batteries', icon: Repeat },
  { index: 3, title: 'Charge Batteries', path: '/charge-batteries', icon: BatteryCharging },
  { index: 4, title: 'Report Damages', path: '/report-damages', icon: ShieldAlert },
  { index: 5, title: 'Clock Out', path: '/clock-out', icon: LogOut },
  { index: 6, title: 'Correction', path: '/corrections', icon: Wrench },
  { index: 7, title: 'Batteries', path: '/batteries', icon: BatteryFull },
  { index: 8, title: 'Polls', path: '/polls', icon: Vote },
  { index: 9, title: 'Create a Budget', path: '/create-budget', icon: Calculator },
  { index: 10, title: 'Require', path: '/requirements', icon: ClipboardList },
  { index: 11, title: 'Asset Manager', path: '/asset-manager', icon: Bike },
  { index: 12, title: 'User Manager', path: '/user-manager', icon: Users },
  { index: 13, title: 'Profiles', path: '/profiles', icon: UserCircle },
  { index: 14, title: 'Create a Poll', path: '/create-poll', icon: PlusSquare },
  { index: 15, title: 'Activity Scheduler', path: '/activity-scheduler', icon: Timer },
  { index: 16, title: 'Add to Calendar', path: '/add-to-calendar', icon: CalendarPlus },
  { index: 17, title: 'Reports', path: '/reports', icon: BarChart3 },
  { index: 18, title: 'Queued Damages', path: '/queued-damages', icon: ListTodo },
  { index: 19, title: 'Memo', path: '/memo', icon: MessageSquareText },
  { index: 20, title: 'Warehouse', path: '/warehouse', icon: Warehouse },
  { index: 21, title: 'Devices', path: '/devices', icon: Smartphone },
  { index: 22, title: 'Settings', path: '/settings', icon: SettingsIcon },
];

export function navForIndices(indices) {
  const set = new Set(indices);
  return NAV_ITEMS.filter((item) => set.has(item.index));
}
