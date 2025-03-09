import Event from '@event'
import { notifyClient } from '@ws'
import Character from '@character'
import { EventType } from '@constants'

class ChangeStatsEvent extends Event {
  source: Character
  targets: Character[]
  manaChange: number
  attackChange: number
  healthChange: number

  constructor(
    source: Character,
    targets: Character[],
    manaChange: number,
    attackChange: number,
    healthChange: number
  ) {
    super(EventType.ChangeStats)
    this.source = source
    this.targets = targets
    this.manaChange = manaChange
    this.attackChange = attackChange
    this.healthChange = healthChange
  }

  execute(): boolean {
    if (this.targets.length === 0) {
      console.log(`Could not execute event ${this.constructor.name}`)
      return false
    }
    // console.log(`Executing ${this}`)

    for (const target of this.targets) {
      const changes: string[] = []
      if (this.manaChange !== 0)
        changes.push(`${this.manaChange > 0 ? '+' : ''}${this.manaChange} mana`)
      if (this.attackChange !== 0)
        changes.push(
          `${this.attackChange > 0 ? '+' : ''}${this.attackChange} attack`
        )
      if (this.healthChange !== 0)
        changes.push(
          `${this.healthChange > 0 ? '+' : ''}${this.healthChange} health`
        )

      target.mana += this.manaChange
      target.attack += this.attackChange
      target.health += this.healthChange

      console.log(
        `${this.targets}: ${changes.length > 0 ? changes.join(', ') : 'no stat changes'}`
      )

      notifyClient(EventType.ChangeStats, true, {})
    }

    return true
  }
}

export default ChangeStatsEvent
