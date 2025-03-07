import Effect from '@effect'
import EffectID from '@effectID'
import Fireball from '@effects/Fireball'

function generateEffect(ID: number, player: number): Effect {
  switch (ID) {
    case EffectID.FIREBALL:
      return new Fireball(player)
    default:
      return new Effect(ID, player)
  }
}

export { generateEffect }
