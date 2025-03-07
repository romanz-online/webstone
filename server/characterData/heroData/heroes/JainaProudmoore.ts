import Hero from '../Hero'

class JainaProudmoore extends Hero {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default JainaProudmoore
