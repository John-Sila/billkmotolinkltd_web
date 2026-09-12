import clsx from 'clsx';

export default function Panel({ className, children, padded = true, ...rest }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-brand-900/[0.06] bg-white shadow-panel',
        'dark:border-white/[0.06] dark:bg-white/[0.03]',
        padded && 'p-5',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
