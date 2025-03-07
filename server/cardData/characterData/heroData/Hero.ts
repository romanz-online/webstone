import Character from '@character'
import HeroData from '@heroData'

class Hero extends Character {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(uniqueID, player, HeroData[baseID - 3000])

    this._isHero = true
  }
}

export default Hero
