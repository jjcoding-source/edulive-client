import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect:    false,
      transports:     ['websocket'],
      withCredentials: true,
    })
  }
  return socket
}

export const connectSocket = (token: string) => {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) s.connect()
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}

// Classroom events 
export const SOCKET_EVENTS = {
  
  JOIN_ROOM:      'classroom:join',
  LEAVE_ROOM:     'classroom:leave',
  SEND_MESSAGE:   'chat:send',
  RAISE_HAND:     'classroom:raiseHand',
  DRAW:           'whiteboard:draw',
  CLEAR_BOARD:    'whiteboard:clear',

  ROOM_JOINED:    'classroom:joined',
  USER_JOINED:    'classroom:userJoined',
  USER_LEFT:      'classroom:userLeft',
  NEW_MESSAGE:    'chat:message',
  PARTICIPANTS:   'classroom:participants',
  BOARD_EVENT:    'whiteboard:event',
  QUIZ_STARTED:   'quiz:started',
  SESSION_ENDED:  'session:ended',
} as const