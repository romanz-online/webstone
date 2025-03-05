import Minion from '../minion'
import GuardianOfKingsBattlecry from '../../effectData/effects/GuardianOfKingsBattlecry'

class GuardianOfKings extends Minion {
  effects: { battlecry: GuardianOfKingsBattlecry }

  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      battlecry: new GuardianOfKingsBattlecry(player, this),
    }
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
