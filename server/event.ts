import { EventType } from './constants'
import { notifyClient } from './ws'
import Minion from './minionData/minion'
import Effect from './effectData/effect'
import { engine } from './Engine'

class Event {
  type: EventType
  data: any

  constructor(type: EventType, data: any) {
    this.type = type
    this.data = data
  }

  execute(): boolean {
    switch (this.type) {
      case EventType.PlayMinion: {
        const hand: any = this.data.hand,
          board: any = this.data.board,
          minion: Minion = this.data.minion,
          boardIndex: number = this.data.boardIndex

        if (!minion || !hand || !board) {
          console.log(`Could not execute event ${this.type}`)
          return false
        }

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
          console.log(`Could not execute event ${this.type}`)
          return false
        }

        board.splice(boardIndex, 0, minion)
        minion.inPlay = true

        notifyClient(this.type, true, {
          minion: this.data.minion,
        })

        return true
      }
      case EventType.Attack: {
        const attacker: Minion = this.data.attacker,
          target: Minion = this.data.target

        if (!attacker && !target) {
          console.log(`Could not execute event ${this.type}`)
          return false
        }

        attacker.attacksThisTurn++

        if (
          (attacker.attacksThisTurn > 0 && !attacker.windfury) ||
          (attacker.attacksThisTurn > 1 && attacker.windfury)
        ) {
          attacker.canAttack = false
        }

        notifyClient(this.type, true, {})

        engine.queueEvent([
          new Event(EventType.Damage, {
            source: attacker,
            target: target,
            amount: attacker.attack,
          }),
          new Event(EventType.Damage, {
            source: target,
            target: attacker,
            amount: target.attack,
          }),
        ])

        return true
      }
      case EventType.Damage: {
        const source: Minion = this.data.source,
          target: Minion = this.data.target,
          amount: number = this.data.number || 0

        if (!source || !target) {
          console.log(`Could not execute event ${this.type}`)
          return false
        }

        target.health -= amount

        if (target.health < 1) {
          // STORE A "killedBy" VALUE HERE IF NEEDED
        }

        console.log(`${source.name} deals ${amount} damage to ${target.name}`)

        notifyClient(this.type, true, {})

        return true
      }
      case EventType.KillMinion: {
        notifyClient(this.type, true, {
          minion: this.data.minion,
        })
        return true
      }
      case EventType.Spell: {
        const effect: Effect | null = this.data.effect,
          source: Minion | null = this.data.source,
          target: Minion | null = this.data.target

        if (!effect || !source) {
          console.log(`Could not execute event ${this.type}`)
          return false
        }

        effect.apply(source, target)

        notifyClient(this.type, true, {})
        return true
      }
      case EventType.Battlecry: {
        const effect: Effect | null = this.data.effect,
          source: Minion | null = this.data.source,
          target: Minion | null = this.data.target

        if (!effect || !source) {
          console.log(`Could not execute event ${this.type}`)
          return false
        }

        effect.apply(source, target)

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
        notifyClient(this.type, true, {})
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
