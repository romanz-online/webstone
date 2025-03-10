import Character from '@character'
import { PlayerID } from '@constants'
import Effect from '@effect'
import EffectID from '@effectID' with { type: 'json' }
import { engine } from '@engine'
import DamageEvent from '@events/DamageEvent.ts'
import { GameInstance } from '@gameInstance'
import PlayerData from '@playerData'

class Swipe extends Effect {
  constructor(id: number, playerOwner: PlayerID) {
    super(EffectID.SWIPE, id, playerOwner)
  }

  apply(source: Character, target: Character | null): void {
    const gameInstance = GameInstance.getCurrent()
    if (!gameInstance) return

    if (
      this.requiresTarget ||
      (gameInstance.getPlayerData(PlayerID.Player2).board.length > 0 &&
        this.canTarget)
    ) {
      console.error('Target required for targeted damage effect')
      return
    }

    const targetID = target.id,
      targetOwner = target.playerOwner,
      player = gameInstance.getPlayerData(targetOwner)

    let otherTargets: Character[]
    for (let i = 0; i < player.board.length; i++) {
      if (player.board[i].id !== targetID) {
        otherTargets.push(player.board[i])
      }
    }
    if (targetID !== PlayerID.Player1 && targetID !== PlayerID.Player2) {
      otherTargets.push(player.hero)
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
