import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'
import Game from '@gameInstance'

class FireElementalBattlecry extends Effect {
  constructor(playerOwner: number) {
    super(EffectID.FIRE_ELEMENTAL_BATTLECRY, -1, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    if (target) {
      engine.queueEvent(new DamageEvent(source, [target], this.getAmount()))
    } else if (
      this.requiresTarget ||
      (Game.getPlayerData(PlayerID.Player2).board.length > 0 && this.canTarget) // INSTEAD OF THIS, CHECK THE LENGTH OF availableTargets
    ) {
      console.error('Target required for targeted damage effect')
    }
  }
}

export default FireElementalBattlecry
