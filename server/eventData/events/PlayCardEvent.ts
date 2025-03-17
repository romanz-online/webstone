import Card from '@card'
import { EventType, PlayerID } from '@constants'
import Event from '@event'
import Game from '@gameInstance'
import { notifyClient } from '@ws'

class PlayCardEvent extends Event {
  playerID: PlayerID
  card: Card
  boardIndex: number

  constructor(playerID: PlayerID, card: Card, boardIndex: number) {
    super(EventType.PlayCard)
    this.playerID = playerID
    this.card = card
    this.boardIndex = boardIndex
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    const playerData = Game.getPlayerData(this.playerID)

    playerData.hand.splice(playerData.hand.indexOf(this.card), 1)[0]

    // summoning and effects are handled in their respective events, which are queued in EventStack

    // OR MAYBE JUST MAKE A SummonMinionEvent HERE AND DIRECTLY EXECUTE IT?
    // const ret: boolean = new SummonMinionEvent(
    //   this.playerID,
    //   this.card as Minion,
    //   this.boardIndex
    // ).execute()
    // if (ret) {
    //   notifyClient(EventType.PlayCard, true, {})
    // } else {
    //   // burn the card if it couldn't be summoned for some reason?
    //   notifyClient(EventType.PlayCard, false, {})
    // }
    // NOT SURE IF THIS IS NECESSARY OR EVEN CORRECT

    notifyClient(EventType.PlayCard, true, {})

    return true
  }
}

export default PlayCardEvent
