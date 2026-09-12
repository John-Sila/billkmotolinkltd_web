export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-900/50 dark:text-white/40">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-brand-900/40">{hint}</span>}
    </label>
  );
}

const base =
  'w-full rounded-xl border border-brand-900/10 bg-brand-900/[0.02] px-3.5 py-2.5 text-sm text-brand-900 outline-none transition focus:border-brand-600 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10';

export function Input(props) {
  return <input className={base} {...props} />;
}

export function Textarea(props) {
  return <textarea className={base + ' min-h-[90px] resize-y'} {...props} />;
}

export function Select({ children, ...rest }) {
  return (
    <select className={base} {...rest}>
      {children}
    </select>
  );
}
