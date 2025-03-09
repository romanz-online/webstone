import Event from '@event'
import { notifyClient } from '@ws'
import Character from '@character'
import { EventType, Keyword } from '@constants'

class DamageEvent extends Event {
  source: Character
  targets: Character[]
  amount: number

  constructor(source: Character, targets: Character[], amount: number) {
    super(EventType.Damage)
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
      const damageTaken = target.takeDamage(this.amount)

      if (this.source.hasKeyword(Keyword.Poison)) {
      }

      console.log(`${this.source} deals ${damageTaken} damage to ${target}`)
    }

    notifyClient(EventType.Damage, true, {})
    return true
  }
}

export default DamageEvent
