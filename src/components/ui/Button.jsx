import clsx from 'clsx'

const variants = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-400',
  ghost: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
  danger: 'bg-red-500 text-white hover:bg-red-400',
  success: 'bg-green-500 text-white hover:bg-green-400',
}

export default function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={clsx(
        'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
