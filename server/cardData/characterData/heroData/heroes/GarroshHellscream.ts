import Hero from '@hero'

class GarroshHellscream extends Hero {
  constructor(baseID: number, id: number, player: number) {
    super(baseID, id, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default GarroshHellscream
