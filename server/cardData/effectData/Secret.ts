import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'

class Secret extends Effect {
  inPlay: boolean

  constructor(baseID: number, id: number, playerOwner: PlayerID) {
    super(baseID, id, playerOwner)

    this.inPlay = false

    // SECRETS WILL NEED TO LISTEN TO THE ENGINE'S EVENTS
  }

  apply(source: Character, target: Character | null): void {}

  validateTarget(target: Character): boolean {
    // CAN'T PLAY TWO OF THE SAME SECRET

    return true
  }
}

export default Secret
