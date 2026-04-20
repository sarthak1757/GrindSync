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
    <aside className="w-full border-b border-zinc-800 bg-zinc-950 p-3 md:w-60 md:border-b-0 md:border-r">
      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {links.map(([label, path]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-300 hover:bg-zinc-800'}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
