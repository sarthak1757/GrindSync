import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, RefreshCw, Sparkles, User } from 'lucide-react'

const links = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Questions', '/questions', ListChecks],
  ['Revision', '/revision', RefreshCw],
  ['Mentor', '/mentor', Sparkles],
  ['Profile', '/profile', User],
]

const mobileNavClasses = ({ isActive }) => `
  flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition
  ${isActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}
`

export default function BottomNav() {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-zinc-800 bg-zinc-950 md:hidden">
      <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {links.map(([label, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={mobileNavClasses}
          >
            {createElement(Icon, { className: 'h-5 w-5' })}
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
