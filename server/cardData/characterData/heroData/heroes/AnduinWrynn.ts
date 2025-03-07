import Hero from '@hero'

class AnduinWrynn extends Hero {
  constructor(baseID: number, uniqueID: number, player: number) {
    super(baseID, uniqueID, player)

    this.effects = {
      heroPower: null,
    }
  }
}

export default AnduinWrynn
