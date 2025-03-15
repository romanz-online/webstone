import Character from '@character'
import HeroData from '@heroData'

class Hero extends Character {
  constructor(baseID: number, id: number, player: number) {
    super(id, player, HeroData[baseID - 3000])
  }

  toJSON(): any {
    return {
      id: this.id,
      fileName: this.fileName,
      playerOwner: this.playerOwner,
      attacksThisTurn: this.attacksThisTurn,
      canAttack: this.canAttack,
      name: this.name,
      description: this.description,
      class: this.class,
      rarity: this.rarity,
      tribe: this.tribe,
      overload: this.overload,
      baseMana: this.baseMana,
      baseAttack: this.baseAttack,
      baseHealth: this.baseHealth,
      maxHealth: this.maxHealth,
      mana: this.mana,
      attack: this.attack,
      health: this.health,
      keywords: this.keywords,
    }
  }
}

export default Hero
