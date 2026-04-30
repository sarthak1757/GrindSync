export default function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`glass-card p-4 transition-all duration-300 hover:border-indigo-500/25 hover:shadow-[0_0_28px_rgba(99,102,241,0.08)] ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}
