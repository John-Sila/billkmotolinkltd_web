import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Moon, SunMedium } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function Login() {
  const { authUser, login } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (authUser) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success('Signed in');
    } catch (err) {
      toast.error(friendlyAuthError(err?.code));
    } finally {
      setBusy(false);
    }
  }

  const dark = theme === 'dark';

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 transition-colors ${
        dark ? 'bg-brand-900' : 'bg-brand-50'
      }`}
    >
      {/* Ambient telemetry backdrop — a nod to the fleet this console runs */}
      <div className={`pointer-events-none absolute inset-0 ${dark ? 'opacity-[0.14]' : 'opacity-30'}`}>
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-400 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-300 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`relative w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur-xl sm:p-10 ${
          dark ? 'border-white/10 bg-white/[0.04]' : 'border-brand-900/10 bg-white/70'
        }`}
      >
        <button
          type="button"
          onClick={toggle}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl transition ${
            dark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-brand-900/45 hover:bg-brand-900/5 hover:text-brand-900'
          }`}
        >
          {dark ? <SunMedium size={17} /> : <Moon size={17} />}
        </button>

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 shadow-lg shadow-brand-600/40 rounded-2xl">
            <Logo size={56} />
          </div>
          <h1 className={`text-xl font-extrabold ${dark ? 'text-white' : 'text-brand-900'}`}>Billk Motolink Ltd</h1>
          <p className={`mt-1 text-sm ${dark ? 'text-white/50' : 'text-brand-900/50'}`}>Fleet operations console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail
              size={17}
              className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${dark ? 'text-white/35' : 'text-brand-900/35'}`}
            />
            <input
              required
              type="email"
              autoComplete="username"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border py-3 pl-10 pr-3.5 text-sm outline-none transition ${
                dark
                  ? 'border-white/10 bg-white/5 text-white placeholder-white/35 focus:border-brand-400 focus:bg-white/10'
                  : 'border-brand-900/10 bg-white text-brand-900 placeholder-brand-900/30 focus:border-brand-600'
              }`}
            />
          </div>
          <div className="relative">
            <Lock
              size={17}
              className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${dark ? 'text-white/35' : 'text-brand-900/35'}`}
            />
            <input
              required
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm outline-none transition ${
                dark
                  ? 'border-white/10 bg-white/5 text-white placeholder-white/35 focus:border-brand-400 focus:bg-white/10'
                  : 'border-brand-900/10 bg-white text-brand-900 placeholder-brand-900/30 focus:border-brand-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${dark ? 'text-white/35 hover:text-white/60' : 'text-brand-900/35 hover:text-brand-900/60'}`}
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <Button type="submit" loading={busy} className="!mt-6 w-full !bg-brand-500 hover:!bg-brand-400" icon={ArrowRight}>
            Sign in
          </Button>
        </form>

        <p className={`mt-6 text-center text-xs ${dark ? 'text-white/35' : 'text-brand-900/35'}`}>
          Access is provisioned by your administrator — riders, managers and staff each see a console built for their role.
        </p>
      </motion.div>
    </div>
  );
}

function friendlyAuthError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks off.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts — wait a moment and try again.';
    default:
      return 'Could not sign in. Check your connection and try again.';
  }
}
