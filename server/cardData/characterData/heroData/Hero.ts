import Character from '@character'
import HeroData from '@heroData'

class Hero extends Character {
  manaAvailable: number
  manaCapacity: number
  manaOverloaded: number

  constructor(baseID: number, id: number, player: number) {
    super(id, player, HeroData[baseID - 3000])
    this.manaAvailable = 10 // 0
    this.manaCapacity = 0
    this.manaOverloaded = 0
  }
}

export default Hero
