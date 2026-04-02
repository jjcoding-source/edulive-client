import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types'

interface AuthState {
  user:          User | null
  token:         string | null
  isLoading:     boolean
  error:         string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user:            null,
  token:           typeof window !== 'undefined' ? localStorage.getItem('edu_token') : null,
  isLoading:       false,
  error:           null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      state.error           = null
      if (typeof window !== 'undefined') {
        localStorage.setItem('edu_token', action.payload.token)
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string>) {
      state.error     = action.payload
      state.isLoading = false
    },
    logout(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.error           = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('edu_token')
      }
    },
    clearError(state) {
      state.error = null
    },
  },
})

export const { setCredentials, setLoading, setError, logout, clearError } = authSlice.actions
export default authSlice.reducer