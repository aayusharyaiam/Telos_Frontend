import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000'

export function SocketProvider({ children }) {
  const { appUser, loading: authLoading } = useAuth()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  useEffect(() => {
    if (authLoading || !appUser?.idToken) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token: appUser.idToken },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected')
      setIsConnected(true)
      setReconnectAttempt(0)
    })

    newSocket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setReconnectAttempt(prev => prev + 1)
    })

    newSocket.on('notification:new', (notification) => {
      console.log('📢 Realtime notification received:', notification)
      toast.custom((t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-dark-surface shadow-lg rounded-xl pointer-events-auto border-l-4 border-primary-container p-4`}
        >
          <div className="flex items-start">
            <div className="shrink-0">
              <span className="text-lg">🔔</span>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900 dark:text-inverse-on-surface">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-ink-600 dark:text-outline">
                {notification.message}
              </p>
              {notification.link && (
                <a
                  href={notification.link}
                  className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                >
                  View Details →
                </a>
              )}
            </div>
          </div>
        </div>
      ), {
        duration: 5000,
        icon: '',
      })

      // Dispatch custom event for other components to update
      window.dispatchEvent(new CustomEvent('realtime-notification', { detail: notification }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [appUser?.idToken, authLoading])

  const value = {
    socket,
    isConnected,
    reconnectAttempt,
    isSocketReady: isConnected && socket !== null,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export default SocketContext