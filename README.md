# Billk Motolink — Fleet Console (Web)

A React + Vite web ERP that reads from the **same Firebase project** as the
Billk Motolink Flutter app, ranked and gated exactly the way the app is.

## Adding your logo

Drop your logo file at **`public/logo.svg`** (PNG works too — just edit
`LOGO_SRC` at the top of `src/components/ui/Logo.jsx` to `/logo.png`).
Anything in Vite's `public/` folder is served as-is from the site root, so
`public/logo.svg` is reachable at `/logo.svg` automatically — no import, no
build step. Until a file exists there, the app quietly falls back to the
default lightning-bolt mark, so nothing breaks in the meantime. The `Logo`
component is already wired into the sidebar header and the login screen —
drop the file in and both update instantly.

## Auth hardening (session boundaries)

- **Logout is a hard redirect** (`window.location.replace('/login')`) after
  `signOut()`, not a client-side route swap — every in-memory value from the
  old session (profile doc, page state, closures) is torn down completely,
  and the history entry is replaced so Back from the login screen can't land
  on a stale protected page.
- **bfcache guard** (`src/lib/bfcache.js`, wired in `main.jsx`): browsers can
  restore a full frozen snapshot of the page on Back/Forward (the
  back-forward cache) without re-running any JS. We listen for
  `pageshow` with `event.persisted` and force a real reload whenever that
  happens, so a signed-out user pressing Back always gets a fresh auth
  check instead of a flash of the page as it looked before they logged out.
- **`Cache-Control: no-store`** meta tags on the document itself, as
  defense-in-depth against the shell HTML being served from a disk/HTTP
  cache after sign-out.
- Deactivation (`isActive` flipping to `false`) goes through the same hard
  sign-out path, with the reason surfaced as a toast after the reload.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173 — you'll land on the login screen first. Sign in
with any account that already exists in the Firebase project's Auth + a
matching `users/{uid}` Firestore doc (same as the mobile app).

To point at a different Firebase project, copy `.env.example` to `.env` and
fill in the values — otherwise it uses the same public web config as the
Flutter app (`billk1`).

```bash
npm run build     # production build to dist/
npm run preview   # preview that build locally
```

## How it mirrors the Flutter app

- **`src/lib/roles.js`** is a line-for-line port of `_rolePermissions` from
  `lib/main.dart` — Staff, Rider, Manager, Systems/IT, Technician, Store
  Keeper, Human Resource and CEO all see the same set of pages here that
  they do in the app.
- **`src/lib/nav.js`** mirrors the Flutter `_pages` / `_titles` order and
  indices, so page N here maps to page N there.
- **Live account deactivation**: if `users/{uid}.isActive` flips to
  `false`, the console signs the user out immediately, same as the
  Flutter `AuthGate` listener.
- **Colors**: pulled directly from `lib/theme/app_theme.dart` — brand teal
  `#00796B`, success `#2E7D32`, warning `#B26A00`, danger `#C62828`, plus
  matching light/dark surface colors.

## Performance & caching

- Firestore is initialized with `persistentLocalCache` (IndexedDB), so
  repeat visits paint instantly from cache before the network round-trip
  resolves — same idea as the Flutter app's `persistenceEnabled: true`.
- Route code-splitting via manual Vite chunks (`firebase`, `charts`,
  `motion`) keeps the initial bundle light.
- The top bar shows a **Live / Cached** indicator so users always know
  whether they're looking at fresh or offline data.

## Firestore collections this reads/writes

Discovered directly from the Flutter source (`.collection(...)` calls):
`users`, `batteries`, `deviations`, `polls`, `expenses`, `damagesReports`,
`store`, `notifications` (as `users/{uid}/notifications`), `memo`,
`items`, `events`, `companyEvents`. A few lighter pages (Requirements,
Devices, Asset Manager) assume reasonably-named collections
(`requirements`, `devices`, `items`) that weren't confirmed in the source
— rename the `path` prop in the relevant `pages/*.jsx` file if your actual
collection names differ.

## Where to take it next

- **Security rules**: this app enforces rank visibility in the UI only,
  the same trust boundary as the Flutter app relying on Firestore rules
  server-side — make sure your rules restrict writes (e.g. `userRank`
  changes) to permitted ranks.
- **Reports → Non-variable docs** tab is a stub; wire it to wherever
  policy documents actually live (Storage, Drive, etc).
- Swap the placeholder `requirements` / `devices` / `items` collection
  names for your real ones if they differ.
"# billkmotolinkltd_web" 
