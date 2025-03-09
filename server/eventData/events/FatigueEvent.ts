import Event from '@event'
import { notifyClient } from '@ws'
import { EventType } from '@constants'
import Hero from '@hero'
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'

class FatigueEvent extends Event {
  player: Hero
  damage: number

  constructor(player: Hero, damage: number) {
    super(EventType.Fatigue)
    this.player = player
    this.damage = damage
  }

  execute(): boolean {
    if (this.damage === 0) {
      console.log(`Could not execute event ${this.constructor.name}`)
      return false
    }

    engine.queueEvent(new DamageEvent(this.player, [this.player], this.damage))

    notifyClient(EventType.Fatigue, true, {})
    return true
  }
}

export default FatigueEvent
