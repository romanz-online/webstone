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

  // NEED TO MAKE SURE THAT THIS TRIGGERS IN SEQUENCE AND IN ORDER OF WHICH CARD WAS PLAYED/REGISTERED FIRST
  async handleEvent(eventName, payload) {
    for (const { event, listener } in this.listenerRegistry) {
      if (event === eventName) {
        await new Promise((resolve) => listener(payload, resolve))
      }
    }
  }
}

const instance = new Engine()
module.exports = instance
