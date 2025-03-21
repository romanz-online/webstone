import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import Fireball from '@effects/Fireball.ts'

function generateEffect(ID: number, id: number, player: number): Effect {
  switch (ID) {
    case EffectID.FIREBALL:
      return new Fireball(id, player)
    default:
      return new Effect(ID, id, player)
  }
}

export { generateEffect }
