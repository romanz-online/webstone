import { EventType, Keyword } from './constants'
import { notifyClient } from './ws'
import Minion from './characterData/minionData/Minion'
import Effect from './effectData/Effect'
import { engine } from './Engine'
import Character from './characterData/Character'

class Event {
  type: EventType
  data: any

  constructor(type: EventType, data: any) {
    this.type = type
    this.data = data
  }

  toString() {
    return `${EventType[this.type]}: ${this.customStringify(this.data)}`
  }

  customStringify(data: any) {
    return JSON.stringify(
      data,
      (key, value) => {
        if (
          value &&
          typeof value === 'object' &&
          'name' in value &&
          'attack' in value &&
          'health' in value &&
          typeof value.toString === 'function'
        ) {
          return `${value.name}-${value.uniqueID}`
        }
        return value
      },
      2
    )
  }

  execute(): boolean {
    // console.log(`${this}`)
    console.log(`${EventType[this.type]}`)
    switch (this.type) {
      case EventType.PlayCard: {
        const hand: any = this.data.hand,
          board: any = this.data.board,
          minion: Minion = this.data.minion,
          boardIndex: number = this.data.boardIndex

        if (!minion || !hand || !board) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        hand.splice(hand.indexOf(minion), 1)[0]

        notifyClient(this.type, true, {
          minion: minion,
        })

        engine.queueEvent([
          new Event(EventType.SummonMinion, {
            board: board,
            minion: minion,
            boardIndex: boardIndex,
          }),
        ])

        return true
      }
      case EventType.SummonMinion: {
        const board: any = this.data.board,
          minion: Minion = this.data.minion,
          boardIndex: number = this.data.boardIndex || board.length

        if (!minion || !board) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        board.splice(boardIndex, 0, minion)
        minion.inPlay = true

        notifyClient(this.type, true, {
          minion: this.data.minion,
        })

        return true
      }
      case EventType.Attack: {
        const attacker: Character = this.data.attacker,
          target: Character = this.data.target

        if (!attacker && !target) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        attacker.attacksThisTurn++

        if (
          (attacker.attacksThisTurn > 0 &&
            !attacker.hasKeyword(Keyword.Windfury)) ||
          (attacker.attacksThisTurn > 1 &&
            attacker.hasKeyword(Keyword.Windfury))
        ) {
          attacker.canAttack = false
        }

        notifyClient(this.type, true, {})

        if (attacker.attack > 0) {
          engine.queueEvent([
            new Event(EventType.Damage, {
              source: attacker,
              target: target,
              amount: attacker.attack,
            }),
          ])
        }

        if (target._isMinion && target.attack > 0) {
          engine.queueEvent([
            new Event(EventType.Damage, {
              source: target,
              target: attacker,
              amount: target.attack,
            }),
          ])
        }

        return true
      }
      case EventType.Damage: {
        const source: Character = this.data.source,
          target: Character = this.data.target,
          amount: number = this.data.amount || 0

        if (!source || !target) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        target.health -= amount

        if (target.health < 1) {
          // STORE A "killedBy" VALUE HERE IF NEEDED
        }

        console.log(`${source} deals ${amount} damage to ${target}`)

        notifyClient(this.type, true, {})

        return true
      }
      case EventType.RestoreHealth: {
        const source: Character = this.data.source,
          target: Character = this.data.target,
          amount: number = this.data.amount || 0

        if (!source || !target) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        let amountRestored = amount
        if (target.health + amount > target.maxHealth) {
          amountRestored = target.maxHealth - target.health
          target.health = target.maxHealth
        } else {
          target.health += amount
        }

        console.log(`${source} restores ${amountRestored} health to ${target}`)

        notifyClient(this.type, true, {})

        return true
      }
      case EventType.Kill: {
        notifyClient(this.type, true, {
          minion: this.data.minion,
        })
        return true
      }
      case EventType.Spell: {
        const effect: Effect | null = this.data.effect,
          source: Character | null = this.data.source,
          target: Character | null = this.data.target

        if (!effect || !source) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        effect.apply(source, target)

        notifyClient(this.type, true, {})
        return true
      }
      case EventType.Battlecry: {
        const effect: Effect | null = this.data.effect,
          source: Minion | null = this.data.source,
          target: Character | null = this.data.target

        if (!effect || !source) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        effect.apply(source, target)
        console.log(`${source} applies a battlecry to ${target}`)

        notifyClient(this.type, true, {})
        return true
      }
      case EventType.ChooseOne: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.Combo: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.Deathrattle: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.DrawCard: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.DiscardCard: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.Overdraw: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.Fatigue: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.ChangeStats: {
        const target: Minion[] = this.data.minion,
          mana: number = this.data.mana || 0,
          attack: number = this.data.attack || 0,
          health: number = this.data.health || 0

        if (target.length === 0) {
          console.log(`Could not execute event ${EventType[this.type]}`)
          return false
        }
        // console.log(`Executing ${this}`)

        for (let i = 0; i < target.length; i++) {
          const changes: string[] = []
          if (mana !== 0) changes.push(`${mana > 0 ? '+' : ''}${mana} mana`)
          if (attack !== 0)
            changes.push(`${attack > 0 ? '+' : ''}${attack} attack`)
          if (health !== 0)
            changes.push(`${health > 0 ? '+' : ''}${health} health`)

          target[i].mana += mana
          target[i].attack += attack
          target[i].health += health

          console.log(
            `${target}: ${changes.length > 0 ? changes.join(', ') : 'no stat changes'}`
          )

          notifyClient(this.type, true, this.data)
        }

        return true
      }
      case EventType.EndTurn: {
        notifyClient(this.type, true, {})
        return true
      }
      case EventType.HeroPower: {
        notifyClient(this.type, true, {})
        return true
      }
    }
    return false
  }
}

export default Event
