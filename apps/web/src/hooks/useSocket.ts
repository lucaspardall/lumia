import { useEffect, useRef } from 'react'
import { getSocket } from '../lib/socket'
import type { Socket } from 'socket.io-client'

// Hook para escutar eventos do Socket.io
export function useSocketEvent<T = any>(
  event: string,
  callback: (data: T) => void,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handler = (data: T) => callbackRef.current(data)
    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [event])
}

// Hook que retorna o socket atual
export function useSocket(): Socket | null {
  return getSocket()
}
