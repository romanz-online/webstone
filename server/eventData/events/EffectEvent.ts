import Character from '@character'
import { EventType } from '@constants'
import Effect from '@effect'
import Event from '@event'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

class EffectEvent extends Event {
  player1: PlayerData
  player2: PlayerData
  effect: Effect
  source: Character
  target: Character

  constructor(
    player1: PlayerData,
    player2: PlayerData,
    effect: Effect,
    source: Character,
    target: Character | null
  ) {
    super(EventType.Effect)
    this.player1 = player1
    this.player2 = player2
    this.effect = effect
    this.source = source
    this.target = target
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.effect.apply(this.player1, this.player2, this.source, this.target)

    notifyClient(EventType.Effect, true, {})
    return true
  }
}

export default EffectEvent
