import { getGameState } from 'wsEvents.ts'
import Effect from '@effect'
import { PlayerID } from '@constants'
import Character from '@character'

class Secret extends Effect {
  inPlay: boolean

  constructor(baseID: number, id: number, playerOwner: PlayerID) {
    super(baseID, id, playerOwner)

    this.inPlay = false

    // SECRETS WILL NEED TO LISTEN TO THE ENGINE'S EVENTS
  }

  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }
  }

  validateTarget(target: Character): boolean {
    const gameState = getGameState()
    if (!gameState) {
      console.error('Missing GameState')
    }

    // CAN'T PLAY TWO OF THE SAME SECRET

    return true
  }
}

export default Secret
