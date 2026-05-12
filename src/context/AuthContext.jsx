// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setProfileLoading(false)
      }
      setSessionLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setProfileLoading(false)
      }
      setSessionLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch profile separately when user changes
  useEffect(() => {
    let alive = true

    if (!user) return

    const fallbackProfile = (user) => ({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || '',
      email: user.email || '',
      role: user.user_metadata?.role || null,
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return
        if (error) {
          setProfile(fallbackProfile(user))
          return
        }
        setProfile(data ?? fallbackProfile(user))
      })
      .finally(() => {
        if (alive) setProfileLoading(false)
      })

    return () => {
      alive = false
    }
  }, [user])

  const loading = sessionLoading || (Boolean(user) && profileLoading)

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email, password, fullName, role) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function bindWallet(walletAddress) {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress })
      .eq('id', user.id)
    if (error) throw error
    setProfile(prev => ({ ...prev, wallet_address: walletAddress }))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, bindWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}