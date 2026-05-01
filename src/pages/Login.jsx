import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'


export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, firebaseConfigError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = location.state?.from?.pathname || '/dashboard'
  const [isRegister, setIsRegister] = useState(location.state?.register || false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) await registerWithEmail(email, password)
      else await loginWithEmail(email, password)
      navigate(redirect, { replace: true })
      toast.success('Welcome to GrindSync')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loginGoogle = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate(redirect, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first to reset password.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md" title={isRegister ? 'Create your account' : 'Welcome back'}>
        {firebaseConfigError ? (
          <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            Login is temporarily unavailable. Please check configuration and restart the app.
          </p>
        ) : null}
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {!isRegister && (
            <div className="flex justify-end">
              <button type="button" onClick={handleResetPassword} className="text-xs text-indigo-400 hover:text-indigo-300">
                Forgot Password?
              </button>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || Boolean(firebaseConfigError)}>{loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}</Button>
        </form>
        <Button variant="ghost" className="mt-3 w-full" onClick={loginGoogle} disabled={loading || Boolean(firebaseConfigError)}>Continue with Google</Button>
        <button className="mt-3 w-full text-sm text-zinc-400 hover:text-zinc-200" onClick={() => setIsRegister((v) => !v)}>
          {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </Card>
    </main>
  )
}
