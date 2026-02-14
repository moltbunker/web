import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Loader2, TerminalSquare, X, Maximize2, Minimize2 } from 'lucide-react'
import { useExecAuth } from '@/hooks/useExecAuth'
import { useExecConnection } from '@/hooks/useExecConnection'
import type { ExecConnectionStatus } from '@/hooks/useExecConnection'

interface TerminalProps {
  containerID: string
  onClose?: () => void
  className?: string
}

const statusLabels: Record<ExecConnectionStatus, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  connected: 'Connected',
  error: 'Error',
  closed: 'Session ended',
}

const statusColors: Record<ExecConnectionStatus, string> = {
  disconnected: 'text-zinc-500',
  connecting: 'text-amber-400',
  connected: 'text-green-400',
  error: 'text-red-400',
  closed: 'text-zinc-500',
}

/**
 * Interactive terminal component for exec-ing into a container.
 * Uses xterm.js for the terminal emulator and WebSocket for real-time I/O.
 * Two-factor auth: session token + wallet signature per session.
 */
export default function Terminal({
  containerID,
  onClose,
  className = '',
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)

  const [connectionStatus, setConnectionStatus] =
    useState<ExecConnectionStatus>('disconnected')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const execAuth = useExecAuth()

  const execConnection = useExecConnection({
    onData: useCallback((data: Uint8Array) => {
      xtermRef.current?.write(data)
    }, []),
    onStatusChange: useCallback((status: ExecConnectionStatus) => {
      setConnectionStatus(status)
    }, []),
    onClose: useCallback((reason: string) => {
      xtermRef.current?.writeln(`\r\n\x1b[33m[Session ended: ${reason}]\x1b[0m`)
    }, []),
    onError: useCallback((msg: string) => {
      setErrorMsg(msg)
      xtermRef.current?.writeln(`\r\n\x1b[31m[Error: ${msg}]\x1b[0m`)
    }, []),
  })

  // Initialize xterm.js
  useEffect(() => {
    if (!terminalRef.current) return

    const term = new XTerm({
      theme: {
        background: '#0a0a0a',
        foreground: '#e4e4e7',
        cursor: '#ef4444',
        cursorAccent: '#0a0a0a',
        selectionBackground: '#ef444433',
        black: '#18181b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(terminalRef.current)

    // Initial fit
    requestAnimationFrame(() => fitAddon.fit())

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // Forward keyboard input to WebSocket
    term.onData((data) => {
      const bytes = new TextEncoder().encode(data)
      execConnection.sendData(bytes)
    })

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddon.fit()
        const dims = fitAddon.proposeDimensions()
        if (dims) {
          execConnection.sendResize(dims.cols, dims.rows)
        }
      })
    })
    resizeObserver.observe(terminalRef.current)

    // Welcome message
    const wsTarget = import.meta.env.VITE_WS_BASE_URL || '(proxy)'
    term.writeln('\x1b[1;31m┌─── MoltBunker Terminal ───┐\x1b[0m')
    term.writeln(`\x1b[90mWebSocket: ${wsTarget}\x1b[0m`)
    term.writeln('\x1b[90mSign with your wallet to connect...\x1b[0m')
    term.writeln('')

    return () => {
      resizeObserver.disconnect()
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-connect: request wallet signature and open WebSocket
  const handleConnect = useCallback(async () => {
    setErrorMsg(null)

    try {
      xtermRef.current?.writeln('\x1b[90mRequesting wallet signature...\x1b[0m')

      // Step 1: Wallet signature + challenge
      const { nonce, signature } = await execAuth.authenticate(containerID)

      xtermRef.current?.writeln('\x1b[90mOpening secure connection...\x1b[0m')
      xtermRef.current?.writeln('')

      // Step 2: Open WebSocket with auth params
      const fitAddon = fitAddonRef.current
      const dims = fitAddon?.proposeDimensions()
      execConnection.connect(
        nonce,
        signature,
        dims?.cols ?? 80,
        dims?.rows ?? 24,
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      setErrorMsg(msg)
      xtermRef.current?.writeln(`\x1b[31mFailed: ${msg}\x1b[0m`)
    }
  }, [containerID, execAuth, execConnection])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="h-3 w-3 rounded-full bg-red-500 transition-opacity hover:opacity-80"
              title="Close"
            />
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="h-3 w-3 rounded-full bg-green-500 transition-opacity hover:opacity-80"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <TerminalSquare className="h-3.5 w-3.5" />
            <span>{containerID.slice(0, 12)}...</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <span
            className={`font-mono text-xs ${statusColors[connectionStatus]}`}
          >
            {connectionStatus === 'connecting' && (
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
            )}
            {statusLabels[connectionStatus]}
          </span>

          {/* Connect / Disconnect button */}
          {connectionStatus === 'disconnected' ||
          connectionStatus === 'closed' ||
          connectionStatus === 'error' ? (
            <button
              onClick={handleConnect}
              disabled={execAuth.isLoading}
              className="rounded bg-red-500/20 px-3 py-1 font-mono text-xs text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
            >
              {execAuth.isLoading ? 'Signing...' : 'Connect'}
            </button>
          ) : connectionStatus === 'connected' ? (
            <button
              onClick={() => execConnection.disconnect()}
              className="rounded bg-zinc-800 px-3 py-1 font-mono text-xs text-zinc-400 transition-colors hover:bg-zinc-700"
            >
              Disconnect
            </button>
          ) : null}

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="flex-1 p-2"
        style={{ minHeight: isFullscreen ? undefined : '400px' }}
      />

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 -z-10 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </motion.div>
  )
}
