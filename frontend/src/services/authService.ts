import api from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface UserRole {
  id: number
  nombre: string
}

export interface AuthenticatedUser {
  id: number
  django_user_id: number
  username: string
  first_name: string
  last_name: string
  is_active: boolean
  created_at: string
  roles: UserRole[]
}

interface RefreshResponse {
  access: string
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthTokens> {
  const response = await api.post<AuthTokens>(
    'auth/login/',
    credentials,
  )

  return response.data
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<string> {
  const response = await api.post<RefreshResponse>(
    'auth/refresh/',
    {
      refresh: refreshToken,
    },
  )

  return response.data.access
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await api.get<AuthenticatedUser>('auth/me/')

  return response.data
}