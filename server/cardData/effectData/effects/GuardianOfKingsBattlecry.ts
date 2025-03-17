import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import RestoreHealthEvent from '@events/RestoreHealthEvent.ts'
import Game from '@gameInstance'

class GuardianOfKingsBattlecry extends Effect {
  constructor(playerOwner: PlayerID) {
    super(EffectID.GUARDIAN_OF_KINGS_BATTLECRY, -1, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    engine.queueEvent(
      new RestoreHealthEvent(
        source,
        [Game.getPlayerData(this.playerOwner).hero],
        this.getAmount()
      )
    )
  }
}

export default GuardianOfKingsBattlecry
