import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Moon, SunMedium, Wifi, WifiOff } from 'lucide-react';
import { NAV_ITEMS } from '../../lib/nav';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const { theme, toggle } = useTheme();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const current = NAV_ITEMS.find((n) => n.path === pathname);
  const count = profile?.numberOfNotifications || 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-900/[0.06] bg-canvas/80 px-4 backdrop-blur-md dark:border-white/[0.06] dark:bg-ink/80 sm:px-6">
      <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-xl text-brand-900 hover:bg-brand-900/5 dark:text-white lg:hidden">
        <Menu size={20} />
      </button>

      <AnimatePresence mode="wait">
        <motion.h2
          key={current?.title || 'page'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="truncate font-bold text-brand-900 dark:text-white"
        >
          {current?.title || 'Billk Motolink'}
        </motion.h2>
      </AnimatePresence>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span
          title={online ? 'Live — connected to Firestore' : 'Offline — showing cached data'}
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold sm:flex ${
            online ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
          }`}
        >
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          {online ? 'Live' : 'Cached'}
        </span>

        <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-xl text-brand-900/70 hover:bg-brand-900/5 dark:text-white/70 dark:hover:bg-white/10">
          {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
        </button>

        <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-xl text-brand-900/70 hover:bg-brand-900/5 dark:text-white/70 dark:hover:bg-white/10">
          <Bell size={18} />
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
            >
              {count > 99 ? '99+' : count}
            </motion.span>
          )}
        </Link>
      </div>
    </header>
  );
}
