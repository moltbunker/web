type Channel = 'deployments' | 'threat' | 'containers' | 'status'

interface WSMessage {
  type: string
  channel?: string
  data?: unknown
}

type EventHandler = (channel: string, data: unknown) => void

export class MoltbunkerWS {
  private ws: WebSocket | null = null
  private url: string
  private token: string | null = null
  private subscriptions = new Set<Channel>()
  private handlers = new Set<EventHandler>()
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private destroyed = false

  private static readonly MAX_RECONNECT_DELAY = 30_000
  private static readonly PING_INTERVAL = 30_000

  constructor(baseUrl: string) {
    // Convert http(s) to ws(s)
    this.url = baseUrl.replace(/^http/, 'ws') + '/ws'
  }

  setToken(token: string) {
    this.token = token
  }

  onEvent(handler: EventHandler) {
    this.handlers.add(handler)
    return () => { this.handlers.delete(handler) }
  }

  connect() {
    if (this.destroyed || this.ws?.readyState === WebSocket.OPEN) return

    const url = this.token ? `${this.url}?token=${this.token}` : this.url

    try {
      this.ws = new WebSocket(url)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempt = 0
      this.startPing()
      // Re-subscribe to all channels
      for (const ch of this.subscriptions) {
        this.send({ type: 'subscribe', channel: ch })
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        if (msg.type === 'pong') return
        if (msg.channel) {
          for (const handler of this.handlers) {
            handler(msg.channel, msg.data)
          }
        }
      } catch {
        // Invalid JSON — ignore
      }
    }

    this.ws.onclose = () => {
      this.stopPing()
      if (!this.destroyed) this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  subscribe(channel: Channel) {
    this.subscriptions.add(channel)
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'subscribe', channel })
    }
  }

  unsubscribe(channel: Channel) {
    this.subscriptions.delete(channel)
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({ type: 'unsubscribe', channel })
    }
  }

  private send(msg: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  private startPing() {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      this.send({ type: 'ping' })
    }, MoltbunkerWS.PING_INTERVAL)
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private scheduleReconnect() {
    if (this.destroyed) return
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempt),
      MoltbunkerWS.MAX_RECONNECT_DELAY,
    )
    this.reconnectAttempt++
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  destroy() {
    this.destroyed = true
    this.stopPing()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.ws?.close()
    this.ws = null
    this.handlers.clear()
    this.subscriptions.clear()
  }
}
