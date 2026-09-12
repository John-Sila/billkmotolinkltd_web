import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-900/15 py-14 text-center dark:border-white/15"
    >
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-white/5">
          <Icon size={22} />
        </span>
      )}
      <div>
        <p className="font-semibold text-brand-900 dark:text-white">{title}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-brand-900/55 dark:text-white/50">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}
