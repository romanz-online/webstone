import Hero from '@hero'

class UtherLightbringer extends Hero {
  constructor(baseID: number, id: number, player: number) {
    super(baseID, id, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default UtherLightbringer
