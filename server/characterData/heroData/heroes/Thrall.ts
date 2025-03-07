import Character from '../../Character'

class Thrall extends Character {
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

export default Thrall
