const { EventEmitter } = require('events')

class Engine extends EventEmitter {
  constructor() {
    super()
    this.eventQueue = []
    this.processing = false
    this.listenerRegistry = {}
  }

  addCardListener(cardID, eventName, listener) {
    if (!this.listenerRegistry[cardID]) {
      this.listenerRegistry[cardID] = []
    }

    this.listenerRegistry[cardID].push({ eventName, listener })
    this.on(eventName, listener)
  }

  removeCardListeners(cardID) {
    if (this.listenerRegistry[cardID]) {
      for (const { eventName, listener } of this.listenerRegistry[cardID]) {
        this.off(eventName, listener)
      }
      delete this.listenerRegistry[cardID]
    }
  }

  queueEvent(eventName, payload) {
    this.eventQueue.push({ eventName, payload })
    if (!this.processing) {
      this.processEvents()
    }
  }

  async processEvents() {
    this.processing = true
    while (this.eventQueue.length > 0) {
      const { eventName, payload } = this.eventQueue.shift()
      await this.handleEvent(eventName, payload)
    }
    this.processing = false
  }

  async handleEvent(eventName, payload) {
    return new Promise((resolve) => {
      this.emit(eventName, payload, resolve)
    })
  }
}

const instance = new Engine()
module.exports = instance
