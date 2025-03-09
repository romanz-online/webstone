import Character from '@character'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'
import PlayerData from '@playerData'

class FireElementalBattlecry extends Effect {
  constructor(playerOwner: number) {
    super(EffectID.FIRE_ELEMENTAL_BATTLECRY, -1, playerOwner)
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

export default FireElementalBattlecry
