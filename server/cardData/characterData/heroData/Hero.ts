import Character from '@character'
import HeroData from '@heroData'

class Hero extends Character {
  constructor(baseID: number, id: number, player: number) {
    super(id, player, HeroData[baseID - 3000])
  }
}

export default Hero
