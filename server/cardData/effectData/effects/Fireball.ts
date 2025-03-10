import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'
import GameInstance from '@gameInstance'

class Fireball extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.FIREBALL, id, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return

    if (target) {
      engine.queueEvent(new DamageEvent(source, [target], this.getAmount()))
    } else if (this.requiresTarget) {
      console.error('Target required for targeted damage effect')
    }
  }
}

export default Fireball
