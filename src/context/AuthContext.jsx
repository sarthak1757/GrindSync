/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  updateProfile,
} from 'firebase/auth'
import { auth, firebaseConfigError } from '../services/firebase'
import { ensureUserDocument, updateUserProfileDB } from '../services/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(auth))

  useEffect(() => {
    if (!auth) return undefined

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) await ensureUserDocument(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Unable to authenticate right now. Try again shortly.')
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await ensureUserDocument(result.user)
    return result.user
  }

  const loginWithEmail = (email, password) => {
    if (!auth) throw new Error('Unable to authenticate right now. Try again shortly.')
    return signInWithEmailAndPassword(auth, email, password)
  }

  const registerWithEmail = async (email, password) => {
    if (!auth) throw new Error('Unable to authenticate right now. Try again shortly.')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await ensureUserDocument(result.user)
    return result.user
  }

  const logout = () => {
    if (!auth) throw new Error('Unable to sign out right now. Try again shortly.')
    return signOut(auth)
  }

  const resetPassword = (email) => {
    if (!auth) throw new Error('Unable to reset password right now.')
    return sendPasswordResetEmail(auth, email)
  }

  const deleteAccount = () => {
    if (!auth || !auth.currentUser) throw new Error('No user logged in.')
    return deleteUser(auth.currentUser)
  }

  const updateUsername = async (newUsername) => {
    if (!auth || !auth.currentUser) throw new Error('No user logged in.')
    await updateProfile(auth.currentUser, { displayName: newUsername })
    await updateUserProfileDB(auth.currentUser.uid, { displayName: newUsername })
    setCurrentUser({ ...auth.currentUser })
  }

  const value = useMemo(() => ({
    currentUser,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    deleteAccount,
    updateUsername,
    logout,
    firebaseConfigError,
  }), [currentUser, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
