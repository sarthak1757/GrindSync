import { Navigate, useLocation } from 'react-router-dom'
import Loader from '../ui/Loader'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader label="Checking authentication" fullScreen />
  if (!currentUser) return <Navigate to="/" replace state={{ from: location }} />
  return children
}
