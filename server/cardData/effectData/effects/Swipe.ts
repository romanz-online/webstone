import { getGameState } from 'wsEvents.ts'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import Event from '@event'
import { EventType, PlayerID } from '@constants'
import Character from '@character'
import GameState from '@gameState'

class Swipe extends Effect {
  constructor(uniqueID: number, playerOwner: PlayerID) {
    super(EffectID.SWIPE, uniqueID, playerOwner)
  }

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

    const targetID = target.uniqueID,
      targetOwner = target.playerOwner,
      targetBoard =
        targetOwner === PlayerID.Player1
          ? gameState.playerBoard
          : gameState.opponentBoard

    let otherTargets: Character[]
    for (let i = 0; i < targetBoard.length; i++) {
      if (targetBoard[i].uniqueID !== targetID) {
        otherTargets.push(targetBoard[i])
      }
    }
    if (targetID !== PlayerID.Player1 && targetID !== PlayerID.Player2) {
      otherTargets.push(
        targetOwner === PlayerID.Player1 ? gameState.player2 : gameState.player1
      )
    }

    engine.queueEvent([
      new Event(EventType.Damage, {
        source: source,
        target: target,
        amount: this.amount[0],
      }),
      new Event(EventType.Damage, {
        source: source,
        target: otherTargets, // IMPLEMENT TARGETTING MULTIPLE TARGETS AT ONCE
        amount: this.amount[1],
      }),
    ])
  }

  validateTarget(gameState: GameState, target: Character): boolean {
    if (!gameState) {
      console.error('Missing GameState')
    }

    return target.playerOwner !== this.playerOwner
  }
}

export default Swipe
