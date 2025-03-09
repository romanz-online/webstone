import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'
import PlayerData from '@playerData'

class Swipe extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.SWIPE, id, playerOwner)
  }

  apply(
    player1: PlayerData,
    player2: PlayerData,
    source: Character,
    target: Character | null
  ): void {
    if (this.requiresTarget || (player2.board.length > 0 && this.canTarget)) {
      console.error('Target required for targeted damage effect')
      return
    }

    const targetID = target.id,
      targetOwner = target.playerOwner,
      targetBoard =
        targetOwner === PlayerID.Player1 ? player1.board : player2.board

    let otherTargets: Character[]
    for (let i = 0; i < targetBoard.length; i++) {
      if (targetBoard[i].id !== targetID) {
        otherTargets.push(targetBoard[i])
      }
    }
    if (targetID !== PlayerID.Player1 && targetID !== PlayerID.Player2) {
      otherTargets.push(
        targetOwner === PlayerID.Player1 ? player1.hero : player2.hero
      )
    }

    engine.queueEvent(new DamageEvent(source, [target], this.amount[0]))
    engine.queueEvent(new DamageEvent(source, otherTargets, this.amount[1]))
  }

  validateTarget(target: Character): boolean {
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
