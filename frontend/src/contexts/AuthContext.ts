import { createContext } from 'react'

import type { AuthenticatedUser } from '@/services/authService'

export interface AuthContextValue {
  user: AuthenticatedUser | null
  isLoading: boolean
  loadCurrentUser: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)