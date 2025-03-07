import Character from '../Character'
import HeroData from './HeroData'

class Hero extends Character {
  _isHero: boolean

  constructor(baseID: number, uniqueID: number, player: number) {
    super(uniqueID, player, HeroData[baseID - 3000])

    this._isHero = true
  }
}

export default Hero
