import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

export default function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <main
        key={location.pathname}
        className="mx-auto min-h-screen max-w-7xl px-4 pt-20 pb-24 animate-fade-in md:pb-8"
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
