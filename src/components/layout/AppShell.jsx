import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <Sidebar />
        <main className="min-h-[calc(100vh-64px)] flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
