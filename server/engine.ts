import { EventEmitter } from 'events'
import Event from './event'
import { EventType } from './constants'

type EventListener = (data: any, done: () => void) => void

interface Listener {
  elementID: any
  eventType: EventType
  listener: EventListener
}

class Engine extends EventEmitter {
  private playerActionQueue: Event[] = []
  private eventQueue: Event[] = []
  private priorityQueue: Event[] = []
  private processing: boolean = false
  private listenerQueue: Listener[] = []

  isBusy(): boolean {
    return (
      this.processing ||
      this.eventQueue.length > 0 ||
      this.priorityQueue.length > 0
    )
  }

  addGameElementListener(
    elementID: string | number,
    eventType: EventType,
    listener: EventListener
  ): void {
    this.listenerQueue.push({ elementID, eventType, listener })
  }

  removeGameElementListener(elementID: any, event: Event): void {
    this.listenerQueue = this.listenerQueue.filter(
      (x) => !(x.elementID === elementID && x.eventType === event.type)
    )
  }

  queuePlayerAction(eventList: Event[]): void {
    eventList.forEach((e) => this.playerActionQueue.push(e))

    this.processNextPlayerAction()
  }

  queueEvent(eventList: Event[]): void {
    eventList.forEach((e) => {
      ;(this.processing ? this.priorityQueue : this.eventQueue).push(e)
    })

    this.processEventQueue()
  }

  private processNextPlayerAction(): void {
    if (this.playerActionQueue.length === 0) return
    if (this.isBusy()) return

    const e: Event | null = this.playerActionQueue.shift() || null
    if (e) this.queueEvent([e])
  }

  private async processEventQueue(): Promise<void> {
    if (this.processing) return

    this.processing = true
    while (this.eventQueue.length > 0 || this.priorityQueue.length > 0) {
      const e =
        this.priorityQueue.length > 0
          ? this.priorityQueue.shift()
          : this.eventQueue.shift()
      if (e) {
        await this.handleEvent(e)
      }
    }
    this.processing = false

    if (this.isBusy()) {
      this.processEventQueue()
    } else {
      this.emit('done', {})
      this.processNextPlayerAction()
    }
  }

  private async handleEvent(e: Event): Promise<void> {
    for (const { eventType, listener } of this.listenerQueue) {
      if (e.type === eventType) {
        // do the event
        e.execute()
        // then wait for listeners to react to it
        await new Promise<void>((resolve) => listener(e, resolve))
        // before moving on
      }
    }
  }
}

export const engine = new Engine()
