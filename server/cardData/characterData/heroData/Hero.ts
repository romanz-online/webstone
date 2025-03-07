import Character from '@character'
import HeroData from '@heroData'

class Hero extends Character {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(uniqueID, player, HeroData[baseID - 3000])
  }
}

export default Hero
