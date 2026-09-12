import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { auth, db } from '../firebase';
import { DEFAULT_ROLE } from '../lib/roles';

const AuthContext = createContext(null);

/**
 * Signs out and then forces a full hard navigation to /login instead of
 * letting React Router quietly swap components in place. Two things this
 * buys us that a plain `signOut()` + client-side redirect don't:
 *  1. Every in-memory value tied to the old session (profile doc,
 *     component state across every mounted page, closures holding stale
 *     data) is torn down completely - nothing protected can be "still
 *     sitting there" for a stray re-render to flash.
 *  2. It replaces the current history entry, so Back from the login page
 *     lands on login again, not on a bfcache snapshot of a protected page
 *     (the pageshow/bfcache guard in src/lib/bfcache.js covers the rest -
 *     see main.jsx).
 */
async function hardSignOut(message) {
  try {
    await fbSignOut(auth);
  } finally {
    if (message) {
      // Read back after reload via sessionStorage since the whole app is
      // about to be torn down.
      sessionStorage.setItem('billk-signout-message', message);
    }
    window.location.replace('/login');
  }
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (u) => setAuthUser(u ?? null)), []);

  useEffect(() => {
    const pending = sessionStorage.getItem('billk-signout-message');
    if (pending) {
      toast.error(pending);
      sessionStorage.removeItem('billk-signout-message');
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const ref = doc(db, 'users', authUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile({ id: snap.id, ...data });
          if (data.isActive === false) {
            hardSignOut('Your account has been deactivated. Please contact support.');
          }
        } else {
          setProfile({ id: authUser.uid });
        }
        setProfileLoading(false);
      },
      () => setProfileLoading(false)
    );
    return unsub;
  }, [authUser]);

  const value = useMemo(
    () => ({
      authUser,
      profile,
      loading: authUser === undefined || (!!authUser && profileLoading),
      role: profile?.userRank || DEFAULT_ROLE,
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      logout: () => hardSignOut(),
    }),
    [authUser, profile, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
