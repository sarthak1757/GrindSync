import { NavLink } from 'react-router-dom'

const links = [
  ['Dashboard', '/dashboard'],
  ['Questions', '/questions'],
  ['Revision', '/revision'],
  ['Mentor', '/mentor'],
  ['Groups', '/groups'],
  ['Challenges', '/challenges'],
  ['Profile', '/profile'],
]

export default function Sidebar() {
  return (
    <aside className="hidden w-full border-b border-zinc-800 bg-black p-3 md:block md:w-60 md:border-b-0 md:border-r md:animate-slide-in">
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {links.map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `min-h-11 rounded-lg px-3 py-2 text-sm transition-all active:scale-95 ${isActive ? 'bg-indigo-500/20 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.12)]' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
