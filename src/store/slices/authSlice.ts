import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AuthService, { LoginPayload, RegisterPayload }   from '@/services/auth.service'
import type { User } from '@/types'

interface AuthState {
  user:            User | null
  token:           string | null
  isLoading:       boolean
  error:           string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user:            null,
  token:           typeof window !== 'undefined' ? localStorage.getItem('edu_token') : null,
  isLoading:       false,
  error:           null,
  isAuthenticated: false,
}


export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await AuthService.register(data)
      return res.data.data as { user: User; token: string }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  },
)

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await AuthService.login(data)
      return res.data.data as { user: User; token: string }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  },
)

export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getMe()
      return res.data.data as User
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user')
    }
  },
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message)
    }
  },
)


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
    clearError(state) { state.error = null },
    clearAuth(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.error           = null
      if (typeof window !== 'undefined') localStorage.removeItem('edu_token')
    },
  },
  extraReducers: (builder) => {
    // register
    builder
      .addCase(registerThunk.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(registerThunk.fulfilled, (s, a) => {
        s.isLoading       = false
        s.user            = a.payload.user
        s.token           = a.payload.token
        s.isAuthenticated = true
        if (typeof window !== 'undefined')
          localStorage.setItem('edu_token', a.payload.token)
      })
      .addCase(registerThunk.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })

    // login
    builder
      .addCase(loginThunk.pending,   (s) => { s.isLoading = true;  s.error = null })
      .addCase(loginThunk.fulfilled, (s, a) => {
        s.isLoading       = false
        s.user            = a.payload.user
        s.token           = a.payload.token
        s.isAuthenticated = true
        if (typeof window !== 'undefined')
          localStorage.setItem('edu_token', a.payload.token)
      })
      .addCase(loginThunk.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })

    // getMe
    builder
      .addCase(getMeThunk.fulfilled, (s, a) => {
        s.user            = a.payload
        s.isAuthenticated = true
        s.isLoading       = false
      })
      .addCase(getMeThunk.rejected, (s) => {
        s.isAuthenticated = false
        s.user            = null
        s.token           = null
        if (typeof window !== 'undefined') localStorage.removeItem('edu_token')
      })

    // logout
    builder
      .addCase(logoutThunk.fulfilled, (s) => {
        s.user            = null
        s.token           = null
        s.isAuthenticated = false
        if (typeof window !== 'undefined') localStorage.removeItem('edu_token')
      })
  },
})

export const { setCredentials, clearError, clearAuth } = authSlice.actions
export default authSlice.reducer