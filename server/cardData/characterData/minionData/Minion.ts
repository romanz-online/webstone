import Character from '@character'
import { CardLocation, EventType } from '@constants'
import Effect from '@effect'
import { engine } from '@engine'
import MinionData from '@minionData'

class Minion extends Character {
  location: CardLocation

  constructor(baseID: number, id: number, player: number) {
    super(id, player, MinionData[baseID - 1000])

    this.location = CardLocation.Deck

    engine.addGameElementListener(
      this.id,
      EventType.TriggerDeath,
      (data, done) => {
        this.onTriggerDeath()
        done()
      }
    )
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
      location: this.location,
    }
  }

  getBattlecry(): Effect | null {
    return this.effects.battlecry
  }

  onTriggerDeath() {
    if (this.location !== CardLocation.Board || this.health > 0) {
      return
    }

    this.location = CardLocation.Graveyard
    // notifyClient('minionDied', true, { minion: this })

    // CHECK DEATHRATTLE
  }
}

export default Minion
