export default function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`glass-card p-4 ${className}`}>
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
