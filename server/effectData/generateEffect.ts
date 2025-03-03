import Effect from './effect'
import EFFECT_ID from './effectID.json'
import Fireball from './effects/fireball'

function generateEffect(ID: number, player: number): Effect {
  switch (ID) {
    case EFFECT_ID.FIREBALL:
      return new Fireball(player)
    default:
      return new Effect(ID, player)
  }
}

export { generateEffect }
