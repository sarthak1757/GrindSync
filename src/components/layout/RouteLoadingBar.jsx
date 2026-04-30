import { useLocation } from 'react-router-dom'

export default function RouteLoadingBar() {
  const location = useLocation()

  return (
    <div
      key={location.pathname}
      className="fixed left-0 top-0 z-[70] h-0.5 bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 shadow-[0_0_16px_rgba(99,102,241,0.75)] animate-route-load"
    />
  )
}
