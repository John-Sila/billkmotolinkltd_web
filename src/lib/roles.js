// Mirrors `_rolePermissions` in lib/main.dart exactly, indexed by the same
// page indices as `_pages` / `_titles` there. Adding a page in nav.js means
// adding its index to whichever ranks should see it here — same contract
// as the Flutter drawer.
export const ROLE_PERMISSIONS = {
  Staff: [0],
  Rider: [0, 1, 2, 3, 4, 5, 6, 7, 8, 22],
  Manager: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21],
  'Systems, IT': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  Technician: [0, 18, 22],
  'Store Keeper': [0, 20, 22],
  'Human Resource': [0, 9, 22],
  CEO: [0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22],
};

export const DEFAULT_ROLE = 'Staff';

export function visibleIndicesForRole(role) {
  const indices = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS[DEFAULT_ROLE];
  return Array.from(new Set(indices)).sort((a, b) => a - b);
}

export function roleBadgeTone(role) {
  switch (role) {
    case 'CEO':
      return 'bg-brand-900 text-white';
    case 'Manager':
    case 'Systems, IT':
      return 'bg-brand-600 text-white';
    case 'Human Resource':
      return 'bg-warning/15 text-warning';
    case 'Store Keeper':
      return 'bg-brand-100 text-brand-800';
    case 'Technician':
      return 'bg-brand-100 text-brand-800';
    case 'Rider':
      return 'bg-success/15 text-success';
    default:
      return 'bg-black/5 text-brand-900';
  }
}
