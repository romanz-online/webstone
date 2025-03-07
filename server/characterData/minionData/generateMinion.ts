import MinionID from './MinionID.json'
import Minion from './Minion'
import GuardianOfKings from './minions/GuardianOfKings'
import ManaWyrm from './minions/ManaWyrm'
import FireElemental from './minions/FireElemental'

function generateMinion(ID: number, uniqueID: number, player: number): Minion {
  switch (ID) {
    case MinionID.MANA_WYRM:
      return new ManaWyrm(ID, uniqueID, player)
    case MinionID.GUARDIAN_OF_KINGS:
      return new GuardianOfKings(ID, uniqueID, player)
    case MinionID.FIRE_ELEMENTAL:
      return new FireElemental(ID, uniqueID, player)
    default:
      return new Minion(ID, uniqueID, player)
  }
}

export { generateMinion }
