import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Quiz, QuizAttempt } from '@/types'

interface QuizState {
  quiz:           Quiz | null
  currentIndex:   number
  attempts:       Record<string, QuizAttempt>
  timeLeft:       number       
  isSubmitted:    boolean
  score:          number | null
}

const initialState: QuizState = {
  quiz:         null,
  currentIndex: 0,
  attempts:     {},
  timeLeft:     0,
  isSubmitted:  false,
  score:        null,
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuiz(state, action: PayloadAction<Quiz>) {
      state.quiz        = action.payload
      state.timeLeft    = action.payload.duration * 60
      state.currentIndex = 0
      state.attempts    = {}
      state.isSubmitted = false
      state.score       = null
    },
    setCurrentIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload
    },
    answerQuestion(state, action: PayloadAction<{ questionId: string; answer: string }>) {
      const { questionId, answer } = action.payload
      state.attempts[questionId] = {
        ...state.attempts[questionId],
        questionId,
        answer,
        flagged: state.attempts[questionId]?.flagged ?? false,
      }
    },
    toggleFlag(state, action: PayloadAction<string>) {
      const qId = action.payload
      if (state.attempts[qId]) {
        state.attempts[qId].flagged = !state.attempts[qId].flagged
      } else {
        state.attempts[qId] = { questionId: qId, answer: '', flagged: true }
      }
    },
    tickTimer(state) {
      if (state.timeLeft > 0) state.timeLeft -= 1
    },
    submitQuiz(state, action: PayloadAction<number>) {
      state.isSubmitted = true
      state.score       = action.payload
    },
    resetQuiz() {
      return initialState
    },
  },
})

export const {
  setQuiz, setCurrentIndex, answerQuestion,
  toggleFlag, tickTimer, submitQuiz, resetQuiz,
} = quizSlice.actions
export default quizSlice.reducer