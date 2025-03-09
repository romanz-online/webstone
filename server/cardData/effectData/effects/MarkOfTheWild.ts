import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import ChangeStatsEvent from '@events/ChangeStatsEvent.ts'
import Minion from '@minion'
import PlayerData from '@playerData'

class MarkOfTheWild extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.MARK_OF_THE_WILD, id, playerOwner)
  }

  apply(
    player1: PlayerData,
    player2: PlayerData,
    source: Character,
    target: Character | null
  ): void {
    if (target) {
      engine.queueEvent(
        // ALSO NEED SOME WAY TO GIVE IT TAUNT
        new ChangeStatsEvent(source, [target], 0, 2, 2)
      )
    }
  }

  validateTarget(target: Character | null): boolean {
    if (!target) {
      if (
        this.requiresTarget ||
        (gameState.opponentBoard.length > 0 && this.canTarget)
      ) {
        console.error('Target required for targeted damage effect')
        return false
      }
    }

    return target instanceof Minion
  }
}

export default MarkOfTheWild
