import type { AuthTokens } from './authService'

const ACCESS_TOKEN_KEY = 'monesy_access_token'
const REFRESH_TOKEN_KEY = 'monesy_refresh_token'

export function saveTokens(tokens: AuthTokens) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

export function saveAccessToken(accessToken: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}