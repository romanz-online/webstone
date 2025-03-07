import Hero from '@hero'

class GarroshHellscream extends Hero {
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

export default GarroshHellscream
