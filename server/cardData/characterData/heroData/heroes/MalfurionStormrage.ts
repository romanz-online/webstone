import Hero from '@hero'

class MalfurionStormrage extends Hero {
  constructor(baseID: number, id: number, player: number) {
    super(baseID, id, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default MalfurionStormrage
