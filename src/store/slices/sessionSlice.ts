import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import SessionService, { CreateSessionPayload } from '@/services/session.service'
import type { Session } from '@/types'

interface SessionState {
  sessions:  Session[]
  current:   Session | null
  isLoading: boolean
  error:     string | null
}

const initialState: SessionState = {
  sessions:  [],
  current:   null,
  isLoading: false,
  error:     null,
}

export const fetchSessions = createAsyncThunk(
  'sessions/fetchAll',
  async (params: { subject?: string; status?: string } | undefined, { rejectWithValue }) => {
    try {
      const res = await SessionService.getAll(params)
      return res.data.data as Session[]
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions')
    }
  },
)

export const fetchSessionById = createAsyncThunk(
  'sessions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await SessionService.getById(id)
      return res.data.data as Session
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Session not found')
    }
  },
)

export const createSession = createAsyncThunk(
  'sessions/create',
  async (data: CreateSessionPayload, { rejectWithValue }) => {
    try {
      const res = await SessionService.create(data)
      return res.data.data as Session
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create session')
    }
  },
)

export const joinSession = createAsyncThunk(
  'sessions/join',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await SessionService.join(id)
      return res.data.data as { roomId: string }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to join session')
    }
  },
)

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearCurrent(state) { state.current = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending,   (s) => { s.isLoading = true })
      .addCase(fetchSessions.fulfilled, (s, a) => { s.isLoading = false; s.sessions = a.payload })
      .addCase(fetchSessions.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload as string })

      .addCase(fetchSessionById.fulfilled, (s, a) => { s.current = a.payload })

      .addCase(createSession.fulfilled, (s, a) => {
        s.sessions.unshift(a.payload)
      })
  },
})

export const { clearCurrent } = sessionSlice.actions
export default sessionSlice.reducer