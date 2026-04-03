import api from '@/lib/api'

const TutorService = {
  getAll: (params?: { subject?: string; sort?: string }) =>
    api.get('/tutors', { params }),

  getById: (id: string) =>
    api.get(`/tutors/${id}`),

  getSessions: (id: string) =>
    api.get(`/tutors/${id}/sessions`),

  addReview: (id: string, data: { rating: number; text: string }) =>
    api.post(`/tutors/${id}/review`, data),
}

export default TutorService