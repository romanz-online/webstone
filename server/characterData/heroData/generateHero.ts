import HeroID from './HeroID.json'
import Minion from './Hero'
import AnduinWrynn from './heroes/AnduinWrynn'
import JainaProudmoore from './heroes/JainaProudmoore'
import Hogger from './heroes/Hogger'
import Hero from './Hero'

function generateHero(ID: number, uniqueID: number, player: number): Minion {
  switch (ID) {
    case HeroID.ANDUIN_WRYNN:
      return new AnduinWrynn(ID, uniqueID, player)
    case HeroID.JAINA_PROUDMOORE:
      return new JainaProudmoore(ID, uniqueID, player)
    case HeroID.HOGGER:
      return new Hogger(ID, uniqueID, player)
    default:
      return new Hero(ID, uniqueID, player)
  }
}

export { generateHero }
