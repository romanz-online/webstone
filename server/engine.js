const { EventEmitter } = require('events')

class Engine extends EventEmitter {
  constructor() {
    super()
    this.eventQueue = []
    this.processing = false
    this.listenerQueue = []
  }

  addGameElementListener(elementID, event, listener) {
    // console.log(`Adding event listener: ${elementID}, ${event}`)
    this.listenerQueue.push({
      elementID: elementID,
      event: event,
      listener: listener,
    })
  }

  removeGameElementListener(elementID, event) {
    this.listenerQueue = this.listenerQueue.filter(
      (x) => !(x.elementID === elementID && x.event === event)
    )
  }

  queueEvent(event, data) {
    // console.log(`Queueing event: ${event}`, data)
    this.eventQueue.push({ event: event, data: data })
    if (!this.processing) {
      this.processEvents()
    }
  }

  async processEvents() {
    this.processing = true
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift()
      // console.log(`Processing event: ${event}`, data)
      await this.handleEvent(event, data)
    }
    this.processing = false
  }

  async handleEvent(e, data) {
    for (const { elementID, event, listener } of this.listenerQueue) {
      if (e === event) {
        // console.log(`Handling event: ${event} for ${elementID}`)
        await new Promise((resolve) => listener(data, resolve))
        if (elementID !== 'gameState') {
          this.emit('eventFinished', e, data)
        }
      }
    }
  }
}

const engine = new Engine()
module.exports = { engine }
