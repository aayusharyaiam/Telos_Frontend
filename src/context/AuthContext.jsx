import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import toast from 'react-hot-toast'
import { auth } from '../firebase/config'
import { getMe, syncUser } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [appUser, setAppUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user || null)

      if (!user) {
        setAppUser(null)
        setLoading(false)
        return
      }

      try {
        await syncUser()
        const me = await getMe()
        setAppUser(me)
      } catch {
        setAppUser(null)
        if (!loading) {
          toast.error('Failed to load your profile. Please refresh the page.')
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [loading])

  const signInUser = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
    setAppUser(null)
  }

  const refreshUser = async () => {
    try {
      const me = await getMe()
      setAppUser(me)
    } catch {
      toast.error('Failed to refresh profile.')
    }
  }

  const value = useMemo(
    () => ({ firebaseUser, appUser, loading, signInUser, signOutUser, refreshUser }),
    [firebaseUser, appUser, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
