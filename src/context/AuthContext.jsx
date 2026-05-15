import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
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
      } catch (err) {
        console.error('Failed to sync user', err)
        setAppUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const signInUser = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOutUser = async () => {
    await signOut(auth)
    setAppUser(null)
  }

  const value = useMemo(
    () => ({ firebaseUser, appUser, loading, signInUser, signOutUser }),
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
