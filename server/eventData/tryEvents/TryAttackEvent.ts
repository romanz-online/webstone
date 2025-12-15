import { EventType } from '@constants'
import TryEvent from '@tryEvent'
import { TryAttackData } from '../EventInterfaces.ts'

/**
 * TryAttack Event
 *
 * Data required: { attackerID: number, targetID: number }
 */
class TryAttackEvent extends TryEvent {
  attackerID: number
  targetID: number

  constructor(attackerID: number, targetID: number) {
    super(EventType.TryAttack)
    this.attackerID = attackerID
    this.targetID = targetID
  }

  // Convenience method to get data as interface
  getData(): TryAttackData {
    return {
      attackerID: this.attackerID,
      targetID: this.targetID,
    }
  }
}

export default TryAttackEvent
