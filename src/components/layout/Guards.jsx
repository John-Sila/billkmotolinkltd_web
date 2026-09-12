import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { visibleIndicesForRole } from '../../lib/roles';
import { NAV_ITEMS } from '../../lib/nav';
import { ShieldOff } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

export function RequireAuth({ children }) {
  const { authUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-canvas dark:bg-ink">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }
  if (!authUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/** Hides/blocks a page if the signed-in user's rank isn't permitted to see it — same rule as the Flutter drawer's `_rolePermissions`. */
export function RequireRank({ path, children }) {
  const { role } = useAuth();
  const item = NAV_ITEMS.find((n) => n.path === path);
  const allowed = item ? visibleIndicesForRole(role).includes(item.index) : true;

  if (!allowed) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Not part of your role"
        description={`${role} accounts don't have access to this page. Ask a manager if you think this is wrong.`}
      />
    );
  }
  return children;
}
