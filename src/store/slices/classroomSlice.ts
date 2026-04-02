import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ChatMessage, Session } from '@/types'

interface Participant {
  userId:   string
  name:     string
  role:     'student' | 'tutor'
  isMuted:  boolean
  hasVideo: boolean
  handRaised: boolean
}

interface ClassroomState {
  session:         Session | null
  participants:    Participant[]
  messages:        ChatMessage[]
  isMuted:         boolean
  isVideoOn:       boolean
  activeTab:       'chat' | 'doubts' | 'people'
  isConnected:     boolean
  handRaised:      boolean
}

const initialState: ClassroomState = {
  session:      null,
  participants: [],
  messages:     [],
  isMuted:      false,
  isVideoOn:    true,
  activeTab:    'chat',
  isConnected:  false,
  handRaised:   false,
}

const classroomSlice = createSlice({
  name: 'classroom',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session>) {
      state.session = action.payload
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload)
    },
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted
    },
    toggleVideo(state) {
      state.isVideoOn = !state.isVideoOn
    },
    toggleHand(state) {
      state.handRaised = !state.handRaised
    },
    setActiveTab(state, action: PayloadAction<ClassroomState['activeTab']>) {
      state.activeTab = action.payload
    },
    updateParticipants(state, action: PayloadAction<Participant[]>) {
      state.participants = action.payload
    },
    resetClassroom() {
      return initialState
    },
  },
})

export const {
  setSession, setConnected, addMessage, setMessages,
  toggleMute, toggleVideo, toggleHand, setActiveTab,
  updateParticipants, resetClassroom,
} = classroomSlice.actions
export default classroomSlice.reducer