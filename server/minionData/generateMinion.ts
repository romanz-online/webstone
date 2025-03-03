import MINION_ID from './minionID.json'
import Minion from './minion'
import GuardianOfKings from './minions/GuardianOfKings'
import ManaWyrm from './minions/ManaWyrm'
import FireElemental from './minions/FireElemental'

function generateMinion(ID: number, uniqueID: number, player: number): Minion {
  switch (ID) {
    case MINION_ID.MANA_WYRM:
      return new ManaWyrm(ID, uniqueID, player)
    case MINION_ID.GUARDIAN_OF_KINGS:
      return new GuardianOfKings(ID, uniqueID, player)
    case MINION_ID.FIRE_ELEMENTAL:
      return new FireElemental(ID, uniqueID, player)
    default:
      return new Minion(ID, uniqueID, player)
  }
}

export { generateMinion }
