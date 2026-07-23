import api from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
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