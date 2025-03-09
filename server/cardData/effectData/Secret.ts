import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import PlayerData from '@playerData'

class Secret extends Effect {
  inPlay: boolean

  constructor(baseID: number, id: number, playerOwner: PlayerID) {
    super(baseID, id, playerOwner)

    this.inPlay = false

    // SECRETS WILL NEED TO LISTEN TO THE ENGINE'S EVENTS
  }

  apply(
    player1: PlayerData,
    player2: PlayerData,
    source: Character,
    target: Character | null
  ): void {}

  validateTarget(target: Character): boolean {
    // CAN'T PLAY TWO OF THE SAME SECRET

    return true
  }
}

export default Secret
