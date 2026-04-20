export default function Loader({ label = 'Loading...', fullScreen = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${fullScreen ? 'min-h-screen' : 'py-8'}`}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      <span className="text-sm text-zinc-300">{label}</span>
    </div>
  )
}
