import Minion from '../minion'
import { notifyClient } from '../../ws'
import GuardianOfKingsBattlecry from '../../effectData/effects/GuardianOfKingsBattlecry'
import GameState from '../../GameState'

class GuardianOfKings extends Minion {
  effects: { battlecry: GuardianOfKingsBattlecry }

  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new GuardianOfKingsBattlecry(player),
    }
  }

  doPlay(gameState: GameState): boolean {
    if (this.effects.battlecry.requiresTarget) {
      notifyClient('getTarget', true, { minion: this })
      return true
    } else {
      this.doBattlecry(gameState, null)
      return false
    }
  }

  doBattlecry(gameState: GameState, target: Minion | null): void {
    this.effects.battlecry.apply(gameState, this, target)
  }
}

export default GuardianOfKings

// FROSTWOLF WARLORD
// {
//   name: 'Battlecry',
//   description:
//     'Gain +1/+1 for each other friendly minion on the battlefield',
//   requiresTarget: false,
//   apply: (gameState, source) => {
//     const friendlyCount = gameState.playerBoard.filter(
//       (minion) => minion !== source
//     ).length
//     source.attack += friendlyCount
//     source.health += friendlyCount
//     source.maxHealth += friendlyCount
//     console.log(
//       `${source.name} gains +${friendlyCount}/+${friendlyCount} from battlecry`
//     )

//     notifyClient('changeStats', true, { minion: this })
//   },
// },
