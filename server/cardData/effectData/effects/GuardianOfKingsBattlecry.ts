import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import RestoreHealthEvent from '@events/RestoreHealthEvent.ts'
import PlayerData from '@playerData'

class GuardianOfKingsBattlecry extends Effect {
  constructor(playerOwner: PlayerID) {
    super(EffectID.GUARDIAN_OF_KINGS_BATTLECRY, -1, playerOwner)
  }

  apply(
    player1: PlayerData,
    player2: PlayerData,
    source: Character,
    target: Character | null
  ): void {
    engine.queueEvent(
      new RestoreHealthEvent(
        source,
        [
          player1.hero.playerOwner === this.playerOwner
            ? player1.hero
            : player2.hero,
        ],
        this.getAmount()
      )
    )
  }
}

export default GuardianOfKingsBattlecry
