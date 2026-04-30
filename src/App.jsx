import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import RouteLoadingBar from './components/layout/RouteLoadingBar'
import Loader from './components/ui/Loader'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { useAuth } from './context/AuthContext'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Questions = lazy(() => import('./pages/Questions'))
const Revision = lazy(() => import('./pages/Revision'))
const Mentor = lazy(() => import('./pages/Mentor'))
const Groups = lazy(() => import('./pages/Groups'))
const GroupDetail = lazy(() => import('./pages/GroupDetail'))
const Challenges = lazy(() => import('./pages/Challenges'))
const Profile = lazy(() => import('./pages/Profile'))

function RootRoute() {
  const { currentUser, loading } = useAuth()
  if (loading) return <Loader label="Loading GrindSync" fullScreen />
  return currentUser ? <Navigate to="/dashboard" replace /> : <Landing />
}

export default function App() {
  return (
    <ErrorBoundary>
      <RouteLoadingBar />
      <Suspense fallback={<Loader label="Loading page" fullScreen />}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'grindsync-toast',
          duration: 3500,
        }}
      />
    </ErrorBoundary>
  )
}
