import { useState, useCallback, useRef, useEffect } from 'react'
import { useApiClient } from '@/hooks/useApi'

// WebSocket frame types (must match Go constants in exec_handler.go)
const WS_DATA = 0x01
const WS_RESIZE = 0x02
const WS_PING = 0x03
const WS_PONG = 0x04
const WS_CLOSE = 0x05
const WS_ERROR = 0x06

/** Default idle timeout in seconds before auto-disconnect. */
export const DEFAULT_IDLE_TIMEOUT = 30

export type ExecConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'closed'

export interface ExecConnectionCallbacks {
  /** Called when terminal output data arrives from the container. */
  onData: (data: Uint8Array) => void
  /** Called when the connection status changes. */
  onStatusChange?: (status: ExecConnectionStatus) => void
  /** Called when the remote session ends. */
  onClose?: (reason: string) => void
  /** Called on error. */
  onError?: (message: string) => void
}

/**
 * useExecConnection manages the WebSocket lifecycle for an exec terminal session.
 * It handles:
 * - WebSocket connection with auth params
 * - Binary frame protocol (data, resize, ping/pong, close, error)
 * - Auto ping/pong keepalive
 * - Idle timeout with optional keep-alive override
 * - Graceful close and cleanup
 */
export function useExecConnection(callbacks: ExecConnectionCallbacks) {
  const { client } = useApiClient()
  const [status, setStatus] = useState<ExecConnectionStatus>('disconnected')
  const [keepAlive, setKeepAlive] = useState(false)
  const [idleSeconds, setIdleSeconds] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const keepAliveRef = useRef(keepAlive)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks
  keepAliveRef.current = keepAlive

  const updateStatus = useCallback(
    (newStatus: ExecConnectionStatus) => {
      setStatus(newStatus)
      callbacksRef.current.onStatusChange?.(newStatus)
    },
    [],
  )

  /** Reset the idle timer (called on user input). */
  const touchActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    setIdleSeconds(0)
  }, [])

  /** Connect to the exec WebSocket endpoint. */
  const connect = useCallback(
    (nonce: string, signature: string, cols: number, rows: number) => {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      updateStatus('connecting')
      touchActivity()

      const url = client.execWebSocketUrl(nonce, signature, cols, rows)
      const ws = new WebSocket(url)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws

      ws.onopen = () => {
        updateStatus('connected')
        touchActivity()

        // Start keepalive pings every 25 seconds
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(new Uint8Array([WS_PING]))
          }
        }, 25_000)

        // Start idle tracker (ticks every second)
        idleTimerRef.current = setInterval(() => {
          const elapsed = Math.floor(
            (Date.now() - lastActivityRef.current) / 1000,
          )
          setIdleSeconds(elapsed)

          if (
            !keepAliveRef.current &&
            elapsed >= DEFAULT_IDLE_TIMEOUT &&
            ws.readyState === WebSocket.OPEN
          ) {
            ws.send(new Uint8Array([WS_CLOSE]))
            setTimeout(() => ws.close(), 500)
            setStatus('closed')
            callbacksRef.current.onClose?.('idle_timeout')
          }
        }, 1000)
      }

      ws.onmessage = (event) => {
        const data = new Uint8Array(event.data as ArrayBuffer)
        if (data.length === 0) return

        const frameType = data[0]
        const frameData = data.slice(1)

        switch (frameType) {
          case WS_DATA:
            callbacksRef.current.onData(frameData)
            break
          case WS_PONG:
            // Keepalive response — nothing to do
            break
          case WS_CLOSE:
            {
              const reason = new TextDecoder().decode(frameData)
              updateStatus('closed')
              callbacksRef.current.onClose?.(reason || 'session_ended')
            }
            break
          case WS_ERROR:
            {
              const msg = new TextDecoder().decode(frameData)
              updateStatus('error')
              callbacksRef.current.onError?.(msg)
            }
            break
        }
      }

      ws.onclose = () => {
        if (status !== 'closed' && status !== 'error') {
          updateStatus('disconnected')
        }
        cleanup()
      }

      ws.onerror = () => {
        updateStatus('error')
        callbacksRef.current.onError?.('WebSocket connection failed')
      }
    },
    [client, updateStatus, status, touchActivity],
  )

  /** Send terminal input data to the container. */
  const sendData = useCallback(
    (data: Uint8Array) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return

      touchActivity()

      const frame = new Uint8Array(1 + data.length)
      frame[0] = WS_DATA
      frame.set(data, 1)
      ws.send(frame)
    },
    [touchActivity],
  )

  /** Send a terminal resize event. */
  const sendResize = useCallback((cols: number, rows: number) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    const frame = new Uint8Array(5)
    frame[0] = WS_RESIZE
    frame[1] = (cols >> 8) & 0xff
    frame[2] = cols & 0xff
    frame[3] = (rows >> 8) & 0xff
    frame[4] = rows & 0xff
    ws.send(frame)
  }, [])

  /** Gracefully close the exec session. */
  const disconnect = useCallback(() => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(new Uint8Array([WS_CLOSE]))
      // Give the server a moment to process, then close
      setTimeout(() => ws.close(), 500)
    }
    cleanup()
    updateStatus('disconnected')
  }, [updateStatus])

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current)
      idleTimerRef.current = null
    }
    setIdleSeconds(0)
    wsRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current)
      }
    }
  }, [])

  return {
    status,
    connect,
    sendData,
    sendResize,
    disconnect,
    keepAlive,
    setKeepAlive,
    idleSeconds,
  }
}
