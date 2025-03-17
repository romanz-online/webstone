import Card from '@card'
import { PlayerID } from '@constants'
import { generateEffect } from '@generateEffect'
import { generateHero } from '@generateHero'
import { generateMinion } from '@generateMinion'
import Hero from '@hero'
import Minion from '@minion'

class PlayerData {
  playerID: PlayerID
  hero: Hero
  deck: Card[]
  hand: Card[]
  board: Minion[]
  graveyard: Minion[]
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
    this.playerID = playerID
    this.hero = generateHero(heroID, id(), playerID)
    this.deck = []
    this.hand = []
    this.board = []
    this.graveyard = []
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
  }

  toJSON(): any {
    return {
      hero: this.hero.toJSON(),
      board: this.boardToJSON(),
      hand: this.handToJSON(),
      mana: this.mana,
      manaCapacity: this.manaCapacity,
      overload: this.overload,
    }
  }

  boardToJSON(): any {
    return this.board.map((m) => m.toJSON())
  }

  handToJSON(): any {
    return this.hand.map((m) => m.toJSON())
  }

  getAvailableMana(): number {
    return this.mana - this.overload
  }
}

export default PlayerData
