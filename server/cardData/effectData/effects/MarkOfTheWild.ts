import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import ChangeStatsEvent from '@events/ChangeStatsEvent.ts'
import GameInstance from '@gameInstance'
import Minion from '@minion'

class MarkOfTheWild extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.MARK_OF_THE_WILD, id, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return

    if (target) {
      engine.queueEvent(
        // ALSO NEED SOME WAY TO GIVE IT TAUNT
        new ChangeStatsEvent(source, [target], 0, 2, 2)
      )
    }
  }

  validateTarget(target: Character | null): boolean {
    return target instanceof Minion
  }
}

export default MarkOfTheWild
