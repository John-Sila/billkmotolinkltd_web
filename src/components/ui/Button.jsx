import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'bg-transparent text-brand-900 hover:bg-brand-900/5 dark:text-white dark:hover:bg-white/10',
  outline: 'bg-transparent border border-brand-900/15 text-brand-900 hover:border-brand-600 hover:text-brand-600 dark:border-white/15 dark:text-white',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  icon: Icon,
  ...rest
}) {
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-11 px-5 text-sm', lg: 'h-12 px-6 text-[15px]' };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </motion.button>
  );
}
