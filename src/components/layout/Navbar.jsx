import { createElement } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, RefreshCw, Sparkles, Swords, User, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Questions', '/questions', ListChecks],
  ['Revision', '/revision', RefreshCw],
  ['AI Mentor', '/mentor', Sparkles],
  ['Groups', '/groups', Users],
  ['Challenges', '/challenges', Swords],
]

const linkClasses = ({ isActive }) => `
  flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
  ${isActive
    ? 'bg-indigo-600 text-white shadow-[0_0_18px_rgba(79,70,229,0.25)]'
    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
  }
`

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = currentUser?.displayName || currentUser?.email || 'Profile'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
              GrindSync
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map(([label, path, Icon]) => (
              <NavLink key={path} to={path} className={linkClasses}>
                {createElement(Icon, { className: 'h-4 w-4' })}
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/profile"
              className={({ isActive }) => `flex min-h-11 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all ${
                isActive ? 'bg-indigo-600/20 text-indigo-100' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white">
                  {avatarInitial}
                </span>
              )}
              <span className="hidden max-w-32 truncate md:block">{displayName}</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
