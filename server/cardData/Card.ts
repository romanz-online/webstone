class Card {
  _isEffect: boolean
  _isHero: boolean
  _isMinion: boolean
  _isWeapon: boolean
  uniqueID: number

  constructor(uniqueID: number) {
    this._isEffect = false
    this._isHero = false
    this._isMinion = false
    this._isWeapon = false
    this.uniqueID = uniqueID
  }
}

export default Card
