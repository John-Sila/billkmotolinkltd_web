import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
    >
      <div>
        {eyebrow && <p className="text-sm font-medium text-brand-600">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
