import { EventType } from '@constants'
import Event from 'eventData/Event.ts'
import { EventEmitter } from 'events'

const DEBUG_ENGINE = false

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

  removeGameElementListener(elementID: any, eventType: EventType): void {
    // MAY NEED TO REMOVE USE OF filter() IF IT MESSES WITH REFERENCES
    this.listenerQueue = this.listenerQueue.filter(
      (x) => !(x.elementID === elementID && x.eventType === eventType)
    )
  }

  queuePlayerAction(event: Event): void {
    if (DEBUG_ENGINE) {
      console.log(`Queuing player action ${event}`)
    }
    this.playerActionQueue.push(event)

    this.processNextPlayerAction()
  }

  queueEvent(event: Event): void {
    const queue = this.processing ? this.priorityQueue : this.eventQueue
    if (DEBUG_ENGINE) {
      console.log(
        `Queuing event ${event} into ${this.processing ? 'priority queue' : 'normal queue'}`
      )
    }
    queue.push(event)

    this.processEventQueue()
  }

  private processNextPlayerAction(): void {
    if (this.playerActionQueue.length === 0) return
    if (this.isBusy()) return

    const e: Event | null = this.playerActionQueue.shift() || null
    if (e) {
      if (DEBUG_ENGINE) {
        console.log(`Processing next player action ${e}`)
      }
      this.queueEvent(e)
    }
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
        if (DEBUG_ENGINE) {
          console.log(`Processing next event ${e}`)
        }
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
    // do the event
    e.execute()
    for (const { eventType, listener } of this.listenerQueue) {
      if (e.type === eventType) {
        // then wait for listeners to react to it
        await new Promise<void>((resolve) => listener(e, resolve))
        // before moving on
      }
    }
  }
}

export const engine = new Engine()
