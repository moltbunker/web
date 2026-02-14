import { useState, useCallback, useRef, useEffect } from 'react'
import { useApiClient } from '@/hooks/useApi'

// WebSocket frame types (must match Go constants in exec_handler.go)
const WS_DATA = 0x01
const WS_RESIZE = 0x02
const WS_PING = 0x03
const WS_PONG = 0x04
const WS_CLOSE = 0x05
const WS_ERROR = 0x06

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
 * - Graceful close and cleanup
 */
export function useExecConnection(callbacks: ExecConnectionCallbacks) {
  const { client } = useApiClient()
  const [status, setStatus] = useState<ExecConnectionStatus>('disconnected')

  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const updateStatus = useCallback(
    (newStatus: ExecConnectionStatus) => {
      setStatus(newStatus)
      callbacksRef.current.onStatusChange?.(newStatus)
    },
    [],
  )

  /** Connect to the exec WebSocket endpoint. */
  const connect = useCallback(
    (nonce: string, signature: string, cols: number, rows: number) => {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      updateStatus('connecting')

      const url = client.execWebSocketUrl(nonce, signature, cols, rows)
      const ws = new WebSocket(url)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws

      ws.onopen = () => {
        updateStatus('connected')

        // Start keepalive pings every 25 seconds
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(new Uint8Array([WS_PING]))
          }
        }, 25_000)
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
    [client, updateStatus, status],
  )

  /** Send terminal input data to the container. */
  const sendData = useCallback((data: Uint8Array) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    const frame = new Uint8Array(1 + data.length)
    frame[0] = WS_DATA
    frame.set(data, 1)
    ws.send(frame)
  }, [])

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
    }
  }, [])

  return {
    status,
    connect,
    sendData,
    sendResize,
    disconnect,
  }
}
