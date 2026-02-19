import { useState, useCallback, useRef, useEffect } from 'react'
import { useApiClient } from '@/hooks/useApi'
import {
  deriveSessionKey,
  generateSessionNonce,
  encryptFrame,
  decryptFrame,
} from '@/lib/exec-crypto'

// WebSocket frame types (must match Go constants in exec_handler.go)
const WS_DATA = 0x01
const WS_RESIZE = 0x02
const WS_PING = 0x03
const WS_PONG = 0x04
const WS_CLOSE = 0x05
const WS_ERROR = 0x06
const WS_KEY_INIT = 0x07
const WS_KEY_ACK = 0x08

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
  /** Called when E2E encryption is established. */
  onEncrypted?: () => void
}

/**
 * useExecConnection manages the WebSocket lifecycle for an exec terminal session.
 * It handles:
 * - WebSocket connection with auth params
 * - Binary frame protocol (data, resize, ping/pong, close, error)
 * - E2E encryption via KEY_INIT/KEY_ACK handshake when execKey is provided
 * - Auto ping/pong keepalive
 * - Idle timeout with optional keep-alive override
 * - Graceful close and cleanup
 */
export function useExecConnection(callbacks: ExecConnectionCallbacks) {
  const { client } = useApiClient()
  const [status, setStatus] = useState<ExecConnectionStatus>('disconnected')
  const [keepAlive, setKeepAlive] = useState(false)
  const [idleSeconds, setIdleSeconds] = useState(0)
  const [encrypted, setEncrypted] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastActivityRef = useRef<number>(0)
  const keepAliveRef = useRef(keepAlive)
  const callbacksRef = useRef(callbacks)
  const sessionKeyRef = useRef<CryptoKey | null>(null)
  const keyAckResolveRef = useRef<(() => void) | null>(null)

  // Sync latest values into refs inside an effect (React 19 ref rules)
  useEffect(() => {
    callbacksRef.current = callbacks
    keepAliveRef.current = keepAlive
  })

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

  /** Handle incoming data frame - decrypt if E2E encryption is active */
  const handleDataFrame = useCallback(async (frameData: Uint8Array) => {
    const sessionKey = sessionKeyRef.current
    if (sessionKey) {
      try {
        const plaintext = await decryptFrame(sessionKey, frameData)
        callbacksRef.current.onData(plaintext)
      } catch {
        callbacksRef.current.onError?.('Decryption failed')
      }
    } else {
      callbacksRef.current.onData(frameData)
    }
  }, [])

  /** Initiate KEY_INIT/KEY_ACK handshake for E2E encryption */
  const initiateKeyExchange = useCallback(
    async (ws: WebSocket, execKey: CryptoKey) => {
      try {
        const sessionNonce = generateSessionNonce()

        // Derive session key locally
        const sessionKey = await deriveSessionKey(execKey, sessionNonce)

        // Send KEY_INIT frame: [0x07][sessionNonce]
        const keyInitFrame = new Uint8Array(1 + sessionNonce.length)
        keyInitFrame[0] = WS_KEY_INIT
        keyInitFrame.set(sessionNonce, 1)
        ws.send(keyInitFrame)

        // Wait for KEY_ACK (with timeout)
        await new Promise<void>((resolve, reject) => {
          keyAckResolveRef.current = resolve
          setTimeout(() => {
            if (keyAckResolveRef.current) {
              keyAckResolveRef.current = null
              reject(new Error('KEY_ACK timeout'))
            }
          }, 10_000)
        })

        // E2E encryption established
        sessionKeyRef.current = sessionKey
        setEncrypted(true)
        callbacksRef.current.onEncrypted?.()
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Key exchange failed'
        callbacksRef.current.onError?.(msg)
      }
    },
    [],
  )

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
    sessionKeyRef.current = null
    setEncrypted(false)
    wsRef.current = null
  }, [])

  /**
   * Connect to the exec WebSocket endpoint.
   * If execKey is provided, initiates E2E encryption handshake after connection.
   */
  const connect = useCallback(
    (
      nonce: string,
      signature: string,
      cols: number,
      rows: number,
      execKey?: CryptoKey,
    ) => {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      updateStatus('connecting')
      touchActivity()
      sessionKeyRef.current = null
      setEncrypted(false)

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

        // If execKey is provided, initiate E2E encryption handshake
        if (execKey) {
          initiateKeyExchange(ws, execKey)
        }
      }

      ws.onmessage = (event) => {
        const data = new Uint8Array(event.data as ArrayBuffer)
        if (data.length === 0) return

        const frameType = data[0]
        const frameData = data.slice(1)

        switch (frameType) {
          case WS_DATA:
            handleDataFrame(frameData)
            break
          case WS_KEY_ACK:
            // Session key exchange complete
            if (keyAckResolveRef.current) {
              keyAckResolveRef.current()
              keyAckResolveRef.current = null
            }
            break
          case WS_PONG:
            // Keepalive response
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
    [client, updateStatus, status, touchActivity, handleDataFrame, initiateKeyExchange, cleanup],
  )

  /** Send terminal input data to the container. */
  const sendData = useCallback(
    async (data: Uint8Array) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return

      touchActivity()

      const sessionKey = sessionKeyRef.current
      if (sessionKey) {
        // E2E encrypt before sending
        const encrypted = await encryptFrame(sessionKey, data)
        const frame = new Uint8Array(1 + encrypted.length)
        frame[0] = WS_DATA
        frame.set(encrypted, 1)
        ws.send(frame)
      } else {
        const frame = new Uint8Array(1 + data.length)
        frame[0] = WS_DATA
        frame.set(data, 1)
        ws.send(frame)
      }
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
  }, [updateStatus, cleanup])

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
    encrypted,
  }
}
