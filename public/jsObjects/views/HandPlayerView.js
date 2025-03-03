import GAME from '../../../game.js'
import { MinionHandView } from './MinionHandView.js'

export class HandPlayerView {
  constructor() {
    this.hand = []
    this.cardViews = []
    this.update()
  }

  getElement() {
    return document.getElementById('playerCards')
  }

  // count() {
  //     return this.hand.count();
  // }

  getCard(index) {
    return this.hand[index]
  }

  addCard(card, animation) {
    this.hand.push(card)
    this.update()

    // trying to do a card draw animation

    // const view = new MinionCardHandView(card, this.count());
    // view.setPlayable(true); // FOR DEBUGGING
    // this.cardViews.push(view);
    // this.getElement().appendChild(view.getElement());
    // view.getElement().offsetHeight;
    // view.getElement().classList.add(animation);
    // view.getElement().offsetHeight;
  }

  changeStats(uniqueID, stats) {
    const index = this.hand.findIndex((c) => c.uniqueID == uniqueID)
    if (index == -1) {
      return
    }

    this.hand[index].mana = stats[0]
    this.hand[index].attack = stats[1]
    this.hand[index].health = stats[2]
    this.cardViews[index].update()
  }

  removeCard(card) {
    const index = this.hand.findIndex((c) => c.uniqueID == card.uniqueID)
    this.hand.splice(index, 1)
    this.cardViews.splice(index, 1)
    const element = this.getElement().querySelector(
      `[data-uniqueid='${card.uniqueID}']`
    )
    if (element) {
      this.getElement().removeChild(element)
    }
  }

  setAllCardsUnplayable() {
    this.cardViews.forEach((i) => {
      i.setPlayable(false)
    })

    this.update()
  }

  update() {
    $('.card').remove()
    this.cardViews = []

    // old code
    // for (let i = 0; i < this.hand.count(); i++) {
    //     const view = new MinionCardHandView(this.hand.cards[i], i);
    //     view.setPlayable(true); // FOR DEBUGGING
    //     this.cardViews.push(view);
    //     this.getElement().appendChild(view.getElement());
    // }

    this.hand.forEach((i) => {
      const view = new MinionHandView(i)
      view.setPlayable(true) // FOR DEBUGGING
      this.cardViews.push(view)
      this.getElement().appendChild(view.getElement())
    })

    GAME.cardPlayController.refresh()
  }
}
