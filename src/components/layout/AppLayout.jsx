import { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-canvas dark:bg-ink">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />

      {open && (
        <div className="fixed inset-0 z-30 bg-brand-900/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="lg:pl-72">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
          {/*
            Deliberately NOT wrapped in <AnimatePresence mode="wait"> here.
            That pattern defers mounting the new route until the previous
            one finishes its exit animation - and if that exit never
            settles (fast repeated navigation, a hook still finishing a
            state update, etc.) the new page never mounts, which reads to
            the user as "this page is just blank until I reload". A plain
            keyed motion.div only animates the entrance, so the incoming
            page always mounts immediately regardless of what the last one
            was doing.
          */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ErrorBoundary resetKey={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
