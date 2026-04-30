import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-700/80 bg-zinc-950/60 px-4 py-16 text-center shadow-[inset_0_0_30px_rgba(99,102,241,0.03)]">
      {Icon && (
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
            <Icon className="h-12 w-12" strokeWidth={1.5} />
          </div>
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold text-zinc-100">{title}</h3>
      <p className="mb-7 max-w-md text-sm leading-6 text-zinc-400">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
      {children}
    </div>
  )
}
