import { configureStore } from '@reduxjs/toolkit'
import authReducer      from './slices/authSlice'
import classroomReducer from './slices/classroomSlice'
import quizReducer      from './slices/quizSlice'

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    classroom: classroomReducer,
    quiz:      quizReducer,
  },
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch