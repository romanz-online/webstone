import { engine } from '@engine'
import Event from '@event'
import Minion from '@minion'
import { notifyClient } from '@ws'
import SummonMinionEvent from './SummonMinionEvent.ts'
import { EventType, PlayerID } from '@constants'
import Card from '@card'
import Effect from '@effect'
import EffectEvent from './EffectEvent.ts'

class PlayCardEvent extends Event {
  player: PlayerID
  hand: any
  board: any
  card: Card
  boardIndex: number

  constructor(
    player: PlayerID,
    hand: any,
    board: any,
    card: Card,
    boardIndex: number
  ) {
    super(EventType.PlayCard)
    // GET RID OF PlayerID USAGE IN MOST PLACES. JUST PASS AROUND Hero REFERENCES
    this.player = player
    this.hand = hand
    this.board = board
    this.card = card
    this.boardIndex = boardIndex
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    notifyClient(EventType.PlayCard, true, {})

    this.hand.splice(this.hand.indexOf(this.card), 1)[0]

    if (this.card instanceof Minion) {
      engine.queueEvent(
        new SummonMinionEvent(this.board, this.card, this.boardIndex)
      )
    } else if (this.card instanceof Effect) {
      // ??????
      // engine.queueEvent([
      //   new EffectEvent(this.card, this.player, this.boardIndex),
      // ])
    }

    return true
  }
}

export default PlayCardEvent
