import { EventType } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import DamageEvent from '@events/DamageEvent.ts'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

class FatigueEvent extends Event {
  player: PlayerData

  constructor(player: PlayerData) {
    super(EventType.Fatigue)
    this.player = player
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.player.fatigue++

    engine.queueEvent(
      new DamageEvent(this.player.hero, [this.player.hero], this.player.fatigue)
    )

    notifyClient(EventType.Fatigue, true, {})
    return true
  }
}

export default FatigueEvent
