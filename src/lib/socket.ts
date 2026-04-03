import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      autoConnect:     false,
      transports:      ['websocket', 'polling'],
      withCredentials: true,
      auth:            { token },
    })
  }
  return socket
}

export const connectSocket = (token: string): Socket => {
  const s = getSocket(token)
  if (!s.connected) {
    s.auth = { token }
    s.connect()
  }
  return s
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}