import api from '@/lib/api'

export interface CreateSessionPayload {
  title:           string
  subject:         string
  startTime:       string
  durationMinutes?: number
  maxStudents?:    number
  description?:   string
}

const SessionService = {
  getAll: (params?: { subject?: string; status?: string }) =>
    api.get('/sessions', { params }),

  getById: (id: string) =>
    api.get(`/sessions/${id}`),

  getByRoomId: (roomId: string) =>
    api.get(`/sessions/room/${roomId}`),

  getUpcoming: () =>
    api.get('/sessions/upcoming'),

  create: (data: CreateSessionPayload) =>
    api.post('/sessions', data),

  goLive: (id: string) =>
    api.patch(`/sessions/${id}/go-live`),

  endSession: (id: string) =>
    api.patch(`/sessions/${id}/end`),

  join: (id: string) =>
    api.post(`/sessions/${id}/join`),
}

export default SessionService