//  Auth 
export type Role = 'student' | 'tutor' | 'admin'

export interface User {
  _id:       string
  name:      string
  email:     string
  role:      Role
  avatar?:   string
  grade?:    string          
  subjects?: string[]        
  rating?:   number          
  createdAt: string
}

// Session / Classroom 
export type SessionStatus = 'scheduled' | 'live' | 'ended'

export interface Session {
  _id:       string
  title:     string
  subject:   string
  tutor:     User
  startTime: string
  endTime?:  string
  status:    SessionStatus
  roomId:    string
  students:  string[]
}

// Quiz 
export type QuestionType = 'mcq' | 'subjective'

export interface Option {
  id:   string
  text: string
}

export interface Question {
  _id:          string
  text:         string
  type:         QuestionType
  options?:     Option[]
  correctOption?: string
  explanation?: string
  marks:        number
  negativeMarks?: number
}

export interface Quiz {
  _id:       string
  title:     string
  subject:   string
  questions: Question[]
  duration:  number          
  createdBy: string
}

export interface QuizAttempt {
  questionId: string
  answer:     string
  isCorrect?: boolean
  flagged:    boolean
}

//  Progress 
export interface SubjectProgress {
  subject:    string
  score:      number
  totalQuizzes: number
  hoursStudied: number
  weakTopics: string[]
}

export interface DashboardStats {
  hoursStudied:   number
  classesAttended: number
  quizAvgScore:   number
  doubtsSolved:   number
  weeklyHours:    number[]
  subjectProgress: SubjectProgress[]
  upcomingSessions: Session[]
  weakAreas:      { topic: string; score: number }[]
}

// Chat / Doubt 
export interface ChatMessage {
  _id:       string
  roomId:    string
  sender:    Pick<User, '_id' | 'name' | 'role'>
  text:      string
  timestamp: string
}

// Tutor 
export interface Review {
  _id:       string
  reviewer:  Pick<User, '_id' | 'name'>
  rating:    number
  text:      string
  createdAt: string
}

export interface TutorProfile extends User {
  bio:            string
  totalStudents:  number
  totalSessions:  number
  satisfactionRate: number
  reviews:        Review[]
  availableSlots: Record<string, string[]>   
}