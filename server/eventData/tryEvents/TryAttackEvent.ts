import { EventType } from '@constants'
import TryEvent from '@tryEvent'

class TryAttackEvent extends TryEvent {
  attackerID: number
  targetID: number

  constructor(attackerID: number, targetID: number) {
    super(EventType.TryAttack)
    this.attackerID = attackerID
    this.targetID = targetID
  }
}

export default TryAttackEvent
