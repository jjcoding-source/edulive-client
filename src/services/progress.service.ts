import api from '@/lib/api'

const ProgressService = {
  getDashboard: () =>
    api.get('/progress/dashboard'),

  logStudyHours: (hours: number, dayIndex: number) =>
    api.post('/progress/study-hours', { hours, dayIndex }),

  classAttended: () =>
    api.post('/progress/class-attended'),

  doubtSolved: () =>
    api.post('/progress/doubt-solved'),
}

export default ProgressService