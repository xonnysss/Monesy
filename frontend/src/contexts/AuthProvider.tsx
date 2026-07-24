import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { AuthContext } from '@/contexts/AuthContext'
import {
  getCurrentUser,
  type AuthenticatedUser,
} from '@/services/authService'
import {
  clearTokens,
  getAccessToken,
} from '@/services/tokenStorage'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isLoading, setIsLoading] = useState(
    () => Boolean(getAccessToken()),
  )

  const loadCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) {
      return
    }

    let isActive = true

    void getCurrentUser()
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        if (isActive) {
          clearTokens()
          setUser(null)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loadCurrentUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
