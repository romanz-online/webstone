import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'
import PlayerData from '@playerData'

class Fireball extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.FIREBALL, id, playerOwner)
  }

  apply(
    player1: PlayerData,
    player2: PlayerData,
    source: Character,
    target: Character | null
  ): void {
    if (target) {
      engine.queueEvent(new DamageEvent(source, [target], this.getAmount()))
    } else if (
      this.requiresTarget ||
      (player2.board.length > 0 && this.canTarget)
    ) {
      console.error('Target required for targeted damage effect')
    }
  }
}

export default Fireball
