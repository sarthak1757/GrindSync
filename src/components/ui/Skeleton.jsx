import clsx from 'clsx'

export default function Skeleton({ className = '' }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-md bg-zinc-900/80 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent',
        className,
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="mb-6 h-3 w-1/2" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  )
}
