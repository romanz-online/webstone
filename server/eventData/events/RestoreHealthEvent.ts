import Event from '@event'
import { notifyClient } from '@ws'
import Character from '@character'
import { EventType } from '@constants'

class RestoreHealthEvent extends Event {
  source: Character
  targets: Character[]
  amount: number

  constructor(source: Character, targets: Character[], amount: number) {
    super(EventType.RestoreHealth)
    this.source = source
    this.targets = targets
    this.amount = amount
  }

  execute(): boolean {
    if (this.targets.length === 0) {
      console.log(`Could not execute event ${this.constructor.name}`)
      return false
    }
    // console.log(`Executing ${this}`)

    for (const target of this.targets) {
      let amountRestored = this.amount
      if (target.health + this.amount > target.maxHealth) {
        amountRestored = target.maxHealth - target.health
        target.health = target.maxHealth
      } else {
        target.health += this.amount
      }

      console.log(
        `${this.source} attempts to restore ${this.amount} health to ${target}`
      )
    }

    notifyClient(EventType.RestoreHealth, true, {})
    return true
  }
}

export default RestoreHealthEvent
