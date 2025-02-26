export class HeroView {
  constructor(playerID) {
    this.health = 0
    this.isPlayer = playerID === 1
    this.divID = this.isPlayer ? 'playerHero' : 'opponentHero'
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
    $(this.isPlayer ? '#playerHeroHealth' : '#opponentHeroHealth').text(
      this.health
    )
  }
}
