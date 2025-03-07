import Effect from '@effect'
import EffectID from '@effectID'
import Fireball from '@effects/Fireball'

function generateEffect(ID: number, uniqueID: number, player: number): Effect {
  switch (ID) {
    case EffectID.FIREBALL:
      return new Fireball(uniqueID, player)
    default:
      return new Effect(ID, uniqueID, player)
  }
}

export { generateEffect }
