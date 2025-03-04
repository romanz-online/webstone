import { EventEmitter } from 'events'

type EventListener = (data: any, done: () => void) => void

interface QueuedEvent {
  event: string
  data: any
}

interface Listener {
  elementID: string | number
  event: string
  listener: EventListener
}

class Engine extends EventEmitter {
  private eventQueue: QueuedEvent[] = []
  private processing: boolean = false
  private listenerQueue: Listener[] = []

  addGameElementListener(
    elementID: string | number,
    event: string,
    listener: EventListener
  ): void {
    this.listenerQueue.push({ elementID, event, listener })
  }

  removeGameElementListener(elementID: string | number, event: string): void {
    this.listenerQueue = this.listenerQueue.filter(
      (x) => !(x.elementID === elementID && x.event === event)
    )
  }

  queueEvent(eventList: QueuedEvent[]): void {
    eventList.forEach((x) => {
      this.eventQueue.push({ event: x.event, data: x.data })
      if (!this.processing) {
        this.processEvents()
      }
    })
  }

  private async processEvents(): Promise<void> {
    this.processing = true
    while (this.eventQueue.length > 0) {
      const x = this.eventQueue.shift()
      if (x) {
        await this.handleEvent(x.event, x.data)
      }
    }
    this.processing = false
  }

  private async handleEvent(e: string, data: any): Promise<void> {
    for (const { event, listener } of this.listenerQueue) {
      if (e === event) {
        await new Promise<void>((resolve) => listener(data, resolve))
      }
    }
  }
}

export const engine = new Engine()
