import clsx from 'clsx';

export default function Badge({ children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-brand-900/[0.06] text-brand-900/70 dark:bg-white/10 dark:text-white/70',
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}
