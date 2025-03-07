import { getGameState } from 'wsEvents.ts'
import Effect from '@effect'
import Event from '@event'
import EffectID from '@effectID' with { type: 'json' }
import Character from '@character'
import { engine } from '@engine'
import { EventType, PlayerID } from '@constants'

class GuardianOfKingsBattlecry extends Effect {
  constructor(playerOwner: PlayerID) {
    super(EffectID.GUARDIAN_OF_KINGS_BATTLECRY, -1, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    engine.queueEvent([
      new Event(EventType.RestoreHealth, {
        source: source,
        target:
          gameState.player1.playerOwner === this.playerOwner
            ? gameState.player1
            : gameState.player2,
        amount: this.getAmount(),
      }),
    ])
  }
}

export default GuardianOfKingsBattlecry
