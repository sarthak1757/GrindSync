import clsx from 'clsx'

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2 py-1 text-xs font-medium',
        tone === 'success' && 'bg-green-500/20 text-green-400',
        tone === 'warning' && 'bg-amber-500/20 text-amber-400',
        tone === 'danger' && 'bg-red-500/20 text-red-400',
        tone === 'primary' && 'bg-indigo-500/20 text-indigo-300',
        tone === 'neutral' && 'bg-zinc-700/40 text-zinc-300',
      )}
    >
      {children}
    </span>
  )
}
