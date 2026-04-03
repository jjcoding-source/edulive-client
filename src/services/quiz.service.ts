import api from '@/lib/api'

export interface CreateQuizPayload {
  title:     string
  subject:   string
  duration?: number
  questions: {
    text:           string
    type:           'mcq' | 'subjective'
    options?:       { id: string; text: string }[]
    correctOption?: string
    explanation?:   string
    marks?:         number
    negativeMarks?: number
  }[]
}

export interface SubmitPayload {
  answers: { questionId: string; answer: string; flagged?: boolean }[]
}

const QuizService = {
  getAll: (params?: { subject?: string }) =>
    api.get('/quizzes', { params }),

  getById: (id: string) =>
    api.get(`/quizzes/${id}`),

  create: (data: CreateQuizPayload) =>
    api.post('/quizzes', data),

  submit: (id: string, data: SubmitPayload) =>
    api.post(`/quizzes/${id}/submit`, data),

  getMyAttempts: () =>
    api.get('/quizzes/my-attempts'),
}

export default QuizService