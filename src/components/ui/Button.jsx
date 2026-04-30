import clsx from 'clsx'

const variants = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.22)]',
  ghost: 'bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800',
  danger: 'bg-red-500 text-white hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.18)]',
  success: 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.18)]',
}

export default function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={clsx(
        'min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
