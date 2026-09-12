import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { navForIndices } from '../../lib/nav';
import { visibleIndicesForRole, roleBadgeTone } from '../../lib/roles';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../lib/format';
import Logo from '../ui/Logo';

export default function Sidebar({ open, onNavigate }) {
  const { profile, role, logout } = useAuth();
  const items = navForIndices(visibleIndicesForRole(role));

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-brand-900/[0.06] bg-white transition-transform duration-300 dark:border-white/[0.06] dark:bg-[#101211] lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo size={40} />
        <div>
          <p className="text-[15px] font-extrabold leading-tight text-brand-900 dark:text-white">Billk Motolink</p>
          <p className="text-xs font-medium text-brand-900/45 dark:text-white/40">Fleet console</p>
        </div>
      </div>

      <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-brand-900/[0.03] p-3 dark:bg-white/[0.04]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {initials(profile?.userName || profile?.email || 'U')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-900 dark:text-white">
            {profile?.userName || 'Unnamed user'}
          </p>
          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleBadgeTone(role)}`}>
            {role}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {items.map(({ index, title, path, icon: Icon }) => (
          <NavLink
            key={index}
            to={path}
            end={path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-brand-900/65 hover:bg-brand-900/[0.04] dark:text-white/60 dark:hover:bg-white/[0.06]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-brand-600 shadow-sm shadow-brand-600/30"
                  />
                )}
                <Icon size={17} className="relative z-10" strokeWidth={2.25} />
                <span className="relative z-10 truncate">{title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-900/[0.06] p-4 dark:border-white/[0.06]">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-danger-bg py-3 text-sm font-bold text-danger transition hover:brightness-95"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}
