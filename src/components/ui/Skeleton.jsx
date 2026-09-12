import clsx from 'clsx';

export default function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-lg bg-brand-900/[0.06] dark:bg-white/10', className)} />;
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-brand-900/[0.06] p-5 dark:border-white/[0.06]">
          <Skeleton className="mb-4 h-3 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
