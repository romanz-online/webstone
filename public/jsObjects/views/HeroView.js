import { PlayerID } from '../constants.js'

export class HeroView {
  constructor(playerID) {
    this.health = 0
    this.playerID = playerID
    this.divID =
      this.playerID === PlayerID.Player1 ? 'playerHero' : 'opponentHero'
    this.update()
  }

  // returns the portrait part of the hero, not the container or health
  getElement() {
    return document.getElementById(this.divID)
  }

  setHealth(health) {
    this.health = health
    this.update()
  }

  update() {
    $(this.playerID ? '#playerHeroHealth' : '#opponentHeroHealth').text(
      this.health
    )
  }
}
