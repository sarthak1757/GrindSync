import Skeleton from './Skeleton'

export default function Loader({ label = 'Loading...', fullScreen = false }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-black' : 'py-8'}`}>
      <div className="w-full max-w-3xl space-y-4 px-4" aria-label={label}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-52 rounded-xl" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}
