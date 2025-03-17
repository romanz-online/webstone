import { EventType, PlayerID } from '@constants'
import { engine } from '@engine'
import Event from '@event'
import DamageEvent from '@events/DamageEvent.ts'
import Game from '@gameInstance'
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

class FatigueEvent extends Event {
  playerID: PlayerID

  constructor(playerID: PlayerID) {
    super(EventType.Fatigue)
    this.playerID = playerID
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const player: PlayerData = Game.getPlayerData(this.playerID)
    player.fatigue++

    engine.queueEvent(
      new DamageEvent(player.hero, [player.hero], player.fatigue)
    )

    notifyClient(EventType.Fatigue, true, {})
    return true
  }
}

export default FatigueEvent
