import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import { PlayerID } from '@constants'
import Character from '@character'
import GameState from '@gameState'
import PlayerData from '@playerData'
import DamageEvent from '@events/DamageEvent.ts'

class Swipe extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.SWIPE, id, playerOwner)
  }

  // NEED TO THINK OF A GOOD WAY FOR BASICALLY ANY CARD TO ACCESS PLAYER DATA
  apply(source: Character, target: Character | null): void {
    const gameState = getGameState()
    if (!gameState || !source) {
      console.error('Missing values to properly execute effect')
    }

    if (
      this.requiresTarget ||
      (gameState.opponentBoard.length > 0 && this.canTarget)
    ) {
      console.error('Target required for targeted damage effect')
      return
    }

    const targetID = target.id,
      targetOwner = target.playerOwner,
      targetBoard =
        targetOwner === PlayerID.Player1
          ? gameState.playerBoard
          : gameState.opponentBoard

    let otherTargets: Character[]
    for (let i = 0; i < targetBoard.length; i++) {
      if (targetBoard[i].id !== targetID) {
        otherTargets.push(targetBoard[i])
      }
    }
    if (targetID !== PlayerID.Player1 && targetID !== PlayerID.Player2) {
      otherTargets.push(
        targetOwner === PlayerID.Player1
          ? gameState.player2Hero
          : gameState.player1Hero
      )
    }

    engine.queueEvent(new DamageEvent(source, [target], this.amount[0]))
    engine.queueEvent(new DamageEvent(source, otherTargets, this.amount[1]))
  }

  validateTarget(target: Character): boolean {
    const gameState: GameState = getGameState()
    if (!gameState) {
      console.error('Missing GameState')
    }

    return target.playerOwner !== this.playerOwner
  }

  availableTargets(perspective: PlayerData, opponent: PlayerData): Character[] {
    let targets = [opponent.hero]
    for (let i = 0; i < opponent.board.length; i++) {
      targets.push(opponent.board[i])
    }
    return targets
  }
}

export default Swipe
