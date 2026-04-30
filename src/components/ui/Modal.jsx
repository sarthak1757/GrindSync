export default function Modal({ open, title, children, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-modal-backdrop">
      <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-black/60 animate-modal-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="min-h-11 min-w-11 rounded-lg text-zinc-400 transition-all hover:bg-zinc-900 hover:text-zinc-200 active:scale-95">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
