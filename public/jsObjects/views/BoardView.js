// import GAME from '../../../game.js'
import { PlayerID } from '../constants.js'
import { MinionBoardView } from './MinionBoardView.js'

export class BoardView {
  constructor(playerID) {
    this.board = []
    this.placeholderIndex = -1
    this.playerID = playerID
    this.divID =
      this.playerID === PlayerID.Player1 ? 'board--player' : 'board--opponent'
    this.update()
  }

  getElement() {
    return document.getElementById(this.divID)
  }

  card(index) {
    return this.cardViews[index]
  }

  playMinion(minion, index) {
    this.board.splice(index, 0, minion)

    const view = new MinionBoardView(this.board[index], index, this.playerID)
    this.cardViews.splice(index, 0, view)

    this.getElement().insertBefore(
      view.getElement(),
      this.getElement().children[index]
    )
  }

  generatePlaceholder(cardX) {
    if (this.cardViews.length == 0) {
      return
    }
    let cardsCount = this.cardViews.length
    for (let i = 0; i < cardsCount; i++) {
      const rect = this.cardViews[i].getElement().getBoundingClientRect()
      const elementCenterX = rect.left + rect.width / 2
      if (cardX < elementCenterX) {
        if (i == this.placeholderIndex) {
          return
        }

        this.placeholderIndex = i

        $('.card--placeholder').remove()

        const childElement = this.getElement().children[this.placeholderIndex],
          placeholderCard = document.createElement('div')
        placeholderCard.classList.add(
          'cardinplay',
          'card--placeholder',
          'cardInPlay--player'
        )
        this.getElement().insertBefore(placeholderCard, childElement)
        return
      }
    }

    if (cardsCount == this.placeholderIndex) {
      return
    }

    this.placeholderIndex = cardsCount

    $('.card--placeholder').remove()

    const childElement = this.getElement().children[this.placeholderIndex],
      placeholderCard = document.createElement('div')
    placeholderCard.classList.add(
      'cardinplay',
      'card--placeholder',
      'cardInPlay--player'
    )
    this.getElement().insertBefore(placeholderCard, childElement)
  }

  removePlaceholder() {
    this.placeholderIndex = -1
    $('.card--placeholder').remove()
  }

  changeStats(id, stats) {
    const index = this.board.findIndex((c) => c.id == id)
    if (index == -1) {
      return
    }

    this.board[index].mana = stats[0]
    this.board[index].attack = stats[1]
    this.board[index].health = stats[2]
    this.cardViews[index].update()
  }

  update() {
    this.getElement().replaceChildren()
    this.cardViews = []

    for (let i = 0; i < this.board.length; i++) {
      const view = new MinionBoardView(this.board[i], i, this.playerID)
      this.cardViews.push(view)
      this.getElement().appendChild(view.getElement())
    }

    GAME.cardPlayController.refresh()
  }
}
