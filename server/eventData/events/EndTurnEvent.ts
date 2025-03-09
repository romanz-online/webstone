import Event from '@event'
import { notifyClient } from '@ws'
import { EventType } from '@constants'
import Minion from '@minion'
import Hero from '@hero'

class EndTurnEvent extends Event {
  player1Hero: Hero
  player2Hero: Hero
  player1Board: Minion[]
  player2Board: Minion[]

  constructor(
    player1Hero: Hero,
    player2Hero: Hero,
    player1Board: Minion[],
    player2Board: Minion[]
  ) {
    super(EventType.EndTurn)
    this.player1Hero = player1Hero
    this.player2Hero = player2Hero
    this.player1Board = player1Board
    this.player2Board = player2Board
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.player1Hero.canAttack = !this.player1Hero.canAttack
    for (const minion of this.player1Board) {
      minion.canAttack = !minion.canAttack
    }

    this.player2Hero.canAttack = !this.player2Hero.canAttack
    for (const minion of this.player2Board) {
      minion.canAttack = !minion.canAttack
    }

    notifyClient(EventType.EndTurn, true, {})
    return true
  }
}

export default EndTurnEvent
