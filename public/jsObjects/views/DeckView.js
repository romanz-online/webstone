import { PlayerID } from '../constants.js'

export class DeckView {
  constructor(playerID) {
    this.cardCount = 0
    this.playerID = playerID
    this.divID =
      this.playerID === PlayerID.Player1 ? 'playerDeck' : 'opponentDeck'
    this.update()
  }

  getElement() {
    return document.getElementById(this.divID)
  }

  // drawCard() {
  //     let card = this.deck.drawCard();
  //     this.update();
  //     return card;
  // }

  update() {
    this.getElement().innerText = this.cardCount
    this.getElement().style.display = this.cardCount == 0 ? 'none' : 'block'
  }
}
