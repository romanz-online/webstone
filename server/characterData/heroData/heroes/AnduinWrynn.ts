import Character from '../../Character'

class AnduinWrynn extends Character {
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

export default AnduinWrynn
