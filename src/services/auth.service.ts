import api from '@/lib/api'

export interface RegisterPayload {
  name:      string
  email:     string
  password:  string
  role?:     'student' | 'tutor'
  grade?:    string
  subjects?: string[]
}

export interface LoginPayload {
  email:    string
  password: string
}

const AuthService = {
  register: (data: RegisterPayload) =>
    api.post('/auth/register', data),

  login: (data: LoginPayload) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),

  updateProfile: (data: Partial<RegisterPayload>) =>
    api.patch('/auth/me', data),
}

export default AuthService