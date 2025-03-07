import Character from '../../Character'

class JainaProudmoore extends Character {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default JainaProudmoore
