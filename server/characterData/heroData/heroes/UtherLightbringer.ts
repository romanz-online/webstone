import Hero from '../Hero'

class UtherLightbringer extends Hero {
  effects: {
    heroPower: null
  }

  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default UtherLightbringer
