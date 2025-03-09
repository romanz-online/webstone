import { generateHero } from '@generateHero'
import { generateMinion } from '@generateMinion'
import { generateEffect } from '@generateEffect'
import MinionID from '@minionID' with { type: 'json' }
import Card from '@card'
import Hero from '@hero'
import Minion from '@minion'
import { PlayerID } from '@constants'

class PlayerData {
  hero: Hero
  deck: Card[]
  hand: Card[]
  board: Minion[]
  fatigue: number
  mana: number
  manaCapacity: number
  overload: number

  constructor(
    heroID: number,
    deckData: number[],
    playerID: PlayerID,
    id: () => number
  ) {
    this.hero = generateHero(heroID, id(), playerID)
    this.deck = []
    this.hand = []
    this.board = []
    this.fatigue = 0
    this.mana = 0
    this.manaCapacity = 0
    this.overload = 0

    this.deck = deckData.map((baseID) => {
      if (baseID >= 2000) {
        return generateEffect(baseID, id(), playerID)
      } else if (baseID >= 1000) {
        return generateMinion(baseID, id(), playerID)
      }
    })

    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }

    // DEBUG

    if (playerID === PlayerID.Player2) {
      this.board = [
        generateMinion(MinionID.CENARIUS, id(), playerID),
        generateMinion(MinionID.KORKRON_ELITE, id(), playerID),
        generateMinion(MinionID.SUMMONING_PORTAL, id(), playerID),
        generateMinion(MinionID.MANA_TIDE_TOTEM, id(), playerID),
        generateMinion(MinionID.ARATHI_WEAPONSMITH, id(), playerID),
      ]
      this.board.forEach((m) => (m.inPlay = true))
    }
  }

  getAvailableMana(): number {
    return this.mana - this.overload
  }
}

export default PlayerData
