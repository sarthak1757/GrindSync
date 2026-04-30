import { useState } from 'react'
import clsx from 'clsx'

export default function ProgressiveImage({ className = '', imgClassName = '', alt, ...props }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span className={clsx('relative inline-block overflow-hidden bg-zinc-900', className)}>
      {!loaded && <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />}
      <img
        {...props}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={clsx(
          'h-full w-full transition-all duration-500',
          loaded ? 'scale-100 blur-0 opacity-100' : 'scale-105 blur-md opacity-0',
          imgClassName,
        )}
      />
    </span>
  )
}
