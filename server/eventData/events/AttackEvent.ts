import { engine } from '@engine'
import Event from '@event'
import Minion from '@minion'
import { notifyClient } from '@ws'
import Character from '@character'
import { EventType, Keyword } from '@constants'
import DamageEvent from '@events/DamageEvent.ts'

class AttackEvent extends Event {
  attacker: Character
  target: Character

  constructor(attacker: Character, target: Character) {
    super(EventType.Attack)
    this.attacker = attacker
    this.target = target
  }

  execute(): boolean {
    // console.log(`Executing ${this}`)

    this.attacker.attacksThisTurn++

    if (
      (this.attacker.attacksThisTurn > 0 &&
        !this.attacker.hasKeyword(Keyword.Windfury)) ||
      (this.attacker.attacksThisTurn > 1 &&
        this.attacker.hasKeyword(Keyword.Windfury))
    ) {
      this.attacker.canAttack = false
    }

    notifyClient(EventType.Attack, true, {})

    if (this.attacker.attack > 0) {
      engine.queueEvent(
        new DamageEvent(this.attacker, [this.target], this.attacker.attack)
      )
    }

    // heroes don't hit back
    if (this.target instanceof Minion && this.target.attack > 0) {
      engine.queueEvent(
        new DamageEvent(this.target, [this.attacker], this.target.attack)
      )
    }

    return true
  }
}

export default AttackEvent
