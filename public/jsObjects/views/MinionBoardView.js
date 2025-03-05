import { PlayerID } from '../constants.js'

export class MinionBoardView {
  constructor(minion, boardIndex, playerID) {
    this.minion = minion
    this.boardIndex = boardIndex
    this.playerID = playerID
    this.element = this.generateElement()
    this.update()
  }

  getElement() {
    return this.element
  }

  // applyDamage(dmg) {
  //     const isDead = this.card.applyDamage(dmg);
  //     this.update();
  //     return isDead;
  // }

  // getAttack() {
  //     return this.card.attack;
  // }

  // triggerDeath() {
  //     this.card.triggerDeath();
  // }

  generateElement() {
    const cardDiv = document.createElement('div'),
      attackValueBackground = document.createElement('div'),
      healthValueBackground = document.createElement('div'),
      attackValue = document.createElement('div'),
      healthValue = document.createElement('div')

    cardDiv.id =
      this.playerID === PlayerID.Player1
        ? `playerCardInPlay${this.boardIndex}`
        : `opponentCardInPlay${this.boardIndex}`
    cardDiv.dataset.boardIndex = this.boardIndex
    cardDiv.dataset.minion = JSON.stringify(this.minion)

    cardDiv.classList.add('cardinplay')
    cardDiv.classList.add(
      this.playerID === PlayerID.Player1
        ? 'cardInPlay--player'
        : 'cardInPlay--opponent'
    )
    // cardDiv.classList.add('placeCardAnim');
    if (this.minion.canAttack) {
      cardDiv.classList.add('canAttack') // TEST THIS
    }

    attackValue.classList.add('attackValue')
    attackValueBackground.classList.add('attackValueBackground')
    cardDiv.appendChild(attackValueBackground)
    attackValueBackground.appendChild(attackValue)

    healthValue.classList.add('healthValue')
    healthValueBackground.classList.add('healthValueBackground')
    cardDiv.appendChild(healthValueBackground)
    healthValueBackground.appendChild(healthValue)

    cardDiv.style.backgroundImage = `url('../media/images/cardimages/${this.minion.fileName}.jpg')`

    return cardDiv
  }

  update() {
    this.getElement().querySelector('.attackValue').innerText =
      this.minion.attack
    if (this.minion.attack > this.minion.baseAttack) {
      this.getElement().querySelector('.attackValue').style.color = 'green'
    }

    this.getElement().querySelector('.healthValue').innerText =
      this.minion.health
    if (this.minion.health > this.minion.baseHealth) {
      this.getElement().querySelector('.healthValue').style.color = 'green'
    } else if (this.minion.health < this.minion.baseHealth) {
      this.getElement().querySelector('.healthValue').style.color = 'red'
    }

    // also update mana
    // this.element.querySelector('.attackValue').innerText = this.attack;
  }
}
