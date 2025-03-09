import { engine } from '@engine'
import Event from '@event'
import Minion from '@minion'
import { notifyClient } from '@ws'
import SummonMinionEvent from './SummonMinionEvent.ts'
import { EventType } from '@constants'
import Card from '@card'
import Effect from '@effect'
import PlayerData from '@playerData'

class PlayCardEvent extends Event {
  playerData: PlayerData
  card: Card
  boardIndex: number

  constructor(playerData: PlayerData, card: Card, boardIndex: number) {
    super(EventType.PlayCard)
    this.playerData = playerData
    this.card = card
    this.boardIndex = boardIndex
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    notifyClient(EventType.PlayCard, true, {})

    this.playerData.hand.splice(this.playerData.hand.indexOf(this.card), 1)[0]

    if (this.card instanceof Minion) {
      engine.queueEvent(
        new SummonMinionEvent(this.playerData.board, this.card, this.boardIndex)
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
