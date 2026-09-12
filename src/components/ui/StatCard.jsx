import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Panel from './Panel';

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function StatCard({ label, value, format = (v) => Math.round(v).toLocaleString(), icon: Icon, tone = 'brand', suffix = '', hint }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const toneClasses = {
    brand: 'text-brand-600 bg-brand-50',
    success: 'text-success bg-success-bg',
    warning: 'text-warning bg-warning-bg',
    danger: 'text-danger bg-danger-bg',
  }[tone];

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-900/60 dark:text-white/60">{label}</span>
        {Icon && (
          <span className={clsx('grid h-8 w-8 place-items-center rounded-xl', toneClasses)}>
            <Icon size={16} strokeWidth={2.25} />
          </span>
        )}
      </div>
      <motion.div layout className="font-mono text-3xl font-semibold tracking-tight tabular">
        {typeof value === 'number' ? format(animated) : value}
        {suffix && <span className="ml-1 text-lg text-brand-900/40 dark:text-white/40">{suffix}</span>}
      </motion.div>
      {hint && <span className="text-xs text-brand-900/50 dark:text-white/40">{hint}</span>}
    </Panel>
  );
}
