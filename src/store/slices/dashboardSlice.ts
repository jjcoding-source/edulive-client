import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ProgressService from '@/services/progress.service'
import SessionService  from '@/services/session.service'

interface DashboardState {
  stats:            any | null
  upcomingSessions: any[]
  isLoading:        boolean
  error:            string | null
}

const initialState: DashboardState = {
  stats:            null,
  upcomingSessions: [],
  isLoading:        false,
  error:            null,
}

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        ProgressService.getDashboard(),
        SessionService.getUpcoming(),
      ])
      return {
        stats:            statsRes.data.data,
        upcomingSessions: sessionsRes.data.data,
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard')
    }
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending,   (s) => { s.isLoading = true; s.error = null })
      .addCase(fetchDashboard.fulfilled, (s, a) => {
        s.isLoading        = false
        s.stats            = a.payload.stats
        s.upcomingSessions = a.payload.upcomingSessions
      })
      .addCase(fetchDashboard.rejected,  (s, a) => {
        s.isLoading = false
        s.error     = a.payload as string
      })
  },
})

export default dashboardSlice.reducer