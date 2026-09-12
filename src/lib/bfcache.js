/**
 * Defeats the browser's back-forward cache (bfcache) for this app.
 *
 * Without this, pressing Back after logging out can instantly repaint the
 * exact DOM the browser had frozen from before sign-out — sidebar, balances,
 * rider data and all — for a moment (or indefinitely on some browsers)
 * before any of our JS re-runs, because bfcache restores a full snapshot of
 * the page instead of re-executing React/Firebase auth checks. The fix is
 * the standard one: listen for `pageshow` with `event.persisted === true`
 * (fired only on a bfcache restore) and force a real reload, which always
 * re-runs `AuthProvider` / `RequireAuth` against the *current* Firebase
 * auth state before anything protected can render.
 */
export function guardAgainstStaleBfcache() {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}
