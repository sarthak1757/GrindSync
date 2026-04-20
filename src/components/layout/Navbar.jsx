import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold text-indigo-300">GrindSync</Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-300 sm:block">{currentUser?.displayName || currentUser?.email}</span>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  )
}
