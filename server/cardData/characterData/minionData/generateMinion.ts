import MinionID from '@minionID' with { type: 'json' }
import Minion from '@minion'
import GuardianOfKings from '@minions/GuardianOfKings.ts'
import ManaWyrm from '@minions/ManaWyrm.ts'
import FireElemental from '@minions/FireElemental.ts'

function generateMinion(ID: number, id: number, player: number): Minion {
  switch (ID) {
    case MinionID.MANA_WYRM:
      return new ManaWyrm(ID, id, player)
    case MinionID.GUARDIAN_OF_KINGS:
      return new GuardianOfKings(ID, id, player)
    case MinionID.FIRE_ELEMENTAL:
      return new FireElemental(ID, id, player)
    default:
      return new Minion(ID, id, player)
  }
}

export { generateMinion }
