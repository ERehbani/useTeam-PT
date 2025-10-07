import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket (): Socket {
  if (socket) return socket

  const API = process.env.NEXT_PUBLIC_API_BACKEND ?? 'http://localhost:3000'
  const NAMESPACE = '/kanban'
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : undefined

  socket = io(`${API}${NAMESPACE}`, {
    transports: ['websocket'],
    withCredentials: true,
    auth: token ? { token } : undefined
  })

  socket.on('connect', () => console.log('WS connected:', socket!.id))
  socket.on('connect_error', err =>
    console.warn('WS connect_error:', err.message)
  )

  return socket
}
