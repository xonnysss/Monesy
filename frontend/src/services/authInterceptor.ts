import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

import api from './api'
import { refreshAccessToken } from './authService'
import {
  clearTokens,
  getRefreshToken,
  saveAccessToken,
} from './tokenStorage'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const SESSION_EXPIRED_EVENT = 'monesy:session-expired'

function notifySessionExpired() {
  clearTokens()
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
}

export function configureAuthInterceptor() {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        originalRequest.url === 'auth/refresh/'
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        notifySessionExpired()
        return Promise.reject(error)
      }

      try {
        const accessToken = await refreshAccessToken(refreshToken)

        saveAccessToken(accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        notifySessionExpired()
        return Promise.reject(refreshError)
      }
    },
  )
}