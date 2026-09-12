import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Subscribes to a Firestore collection (optionally with query constraints)
 * and keeps local state in sync. Because Firestore is initialized with a
 * persistentLocalCache, onSnapshot fires immediately from the on-disk cache
 * before the network round-trip resolves, so the UI paints instantly on
 * repeat visits and still updates live when fresh data arrives.
 *
 * The re-subscribe key is built only from `path` plus each constraint's
 * public, documented `.type` field (e.g. 'orderBy', 'limit', 'where') -
 * deliberately not from any constraint's private internals, which aren't
 * part of the SDK's public contract and can silently return `undefined`
 * across every render, masking real changes or causing needless re-renders.
 *
 * @param {string} path collection path, e.g. 'batteries'
 * @param {...import('firebase/firestore').QueryConstraint} constraints
 */
export function useFirestoreCollection(path, ...constraints) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const retryRef = useRef(0);

  const constraintKey = constraints.map((c) => c?.type || 'c').join('|');

  useEffect(() => {
    if (!path) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const q = query(collection(db, path), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (cancelled) return;
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setFromCache(snap.metadata.fromCache);
        setLoading(false);
        setError(null);
        retryRef.current = 0;
      },
      (err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
        // Permission/timing errors right after sign-in (the auth token
        // attaching a beat after the first render) are transient - retry a
        // couple of times with backoff instead of leaving the page stuck
        // empty until a manual reload.
        if (retryRef.current < 2 && (err.code === 'permission-denied' || err.code === 'unavailable')) {
          const attempt = retryRef.current + 1;
          retryRef.current = attempt;
          setTimeout(() => {
            if (!cancelled) {
              // Re-running the effect body directly (cheap, and avoids
              // needing extra state just to force a re-subscribe).
              const retryQ = query(collection(db, path), ...constraints);
              onSnapshot(
                retryQ,
                (snap) => {
                  if (cancelled) return;
                  setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                  setFromCache(snap.metadata.fromCache);
                  setLoading(false);
                  setError(null);
                },
                () => {}
              );
            }
          }, attempt * 800);
        }
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, constraintKey]);

  return { data, loading, error, fromCache };
}
