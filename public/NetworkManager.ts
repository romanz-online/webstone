import { EventType } from './constants.ts'

export const networkConnectedEvent: string = 'connected'
export const networkDisconnectedEvent: string = 'disconnected'
export const networkErrorEvent: string = 'error'

interface EventHandler {
  onSuccess: (data: any) => void
  onFailure: (data: any) => void
}

export class NetworkManager extends EventTarget {
  private ws: WebSocket | null = null
  private eventHandlers: Map<EventType, EventHandler[]> = new Map()
  private url: string

  constructor(url: string) {
    super()
    this.url = url
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Connecting WebSocket...')
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('Connected to WebSocket server')
        this.dispatchEvent(new CustomEvent(networkConnectedEvent))
        resolve()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.dispatchEvent(
          new CustomEvent(networkErrorEvent, { detail: error })
        )
        reject(error)
      }

      this.ws.onclose = () => {
        console.log('Disconnected from WebSocket server')
        this.dispatchEvent(new CustomEvent(networkDisconnectedEvent))
      }

      this.ws.onmessage = (evt: MessageEvent) => {
        this.handleMessage(evt)
      }
    })
  }

  public registerHandler(
    event: EventType,
    onSuccess: (data: any) => void,
    onFailure: (data: any) => void = () => {}
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }

    this.eventHandlers.get(event)!.push({ onSuccess, onFailure })
  }

  public sendEvent(event: EventType, data: any = {}): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }))
    } else {
      console.error('WebSocket not connected')
    }
  }

  private handleMessage(evt: MessageEvent): void {
    const { eventType, success, data } = JSON.parse(evt.data)

    // Get event type name for logging
    const eventTypeName =
      Object.keys(EventType)[Object.values(EventType).indexOf(eventType)] ||
      `Unknown(${eventType})`

    console.log(success ? 'SUCCESS' : 'FAIL', eventTypeName)

    // Call registered handlers for this event type
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => {
        if (success) {
          handler.onSuccess(data)
        } else {
          handler.onFailure(data)
        }
      })
    }

    // Emit generic serverevent for coordinator to handle
    this.dispatchEvent(
      new CustomEvent('serverevent', {
        detail: { eventType, success, data },
      })
    )
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  public dispose(): void {
    this.disconnect()
    this.eventHandlers.clear()
  }
}
