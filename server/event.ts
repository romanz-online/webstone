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
          boardIndex: number = this.data.boardIndex || board.length

        if (!minion || !hand || !board) {
          return false
        }

        hand.splice(hand.indexOf(minion), 1)[0]

        notifyClient('playMinion', true, {
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
          return false
        }

        board.splice(boardIndex, 0, minion)
        minion.inPlay = true

        notifyClient('summonMinion', true, {
          minion: this.data.minion,
        })

        return true
      }
      case EventType.Attack: {
        const attacker: Minion = this.data.attacker,
          target: Minion = this.data.target

        if (!attacker && !target) {
          return false
        }

        attacker.attacksThisTurn++

        if (
          (attacker.attacksThisTurn > 0 && !attacker.windfury) ||
          (attacker.attacksThisTurn > 1 && attacker.windfury)
        ) {
          attacker.canAttack = false
        }

        notifyClient('attack', true, {})

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
          return false
        }

        target.health -= amount

        if (target.health < 1) {
          // STORE A "killedBy" VALUE HERE IF NEEDED
        }

        console.log(`${source.name} deals ${amount} damage to ${target.name}`)

        notifyClient('damage', true, {})

        return true
      }
      case EventType.KillMinion: {
        notifyClient('killMinion', true, {
          minion: this.data.minion,
        })
        return true
      }
      case EventType.Spell: {
        const effect: Effect | null = this.data.effect,
          source: Minion | null = this.data.source,
          target: Minion | null = this.data.target

        if (!effect || !source) {
          return false
        }

        effect.apply(source, target)

        notifyClient('spell', true, {})
        return true
      }
      case EventType.Battlecry: {
        const effect: Effect | null = this.data.effect,
          source: Minion | null = this.data.source,
          target: Minion | null = this.data.target

        if (!effect || !source) {
          return false
        }

        effect.apply(source, target)

        notifyClient('battlecry', true, {})
        return true
      }
      case EventType.ChooseOne: {
        notifyClient('choose_one', true, {})
        return true
      }
      case EventType.Combo: {
        notifyClient('combo', true, {})
        return true
      }
      case EventType.Deathrattle: {
        notifyClient('deathrattle', true, {})
        return true
      }
      case EventType.DrawCard: {
        notifyClient('draw_card', true, {})
        return true
      }
      case EventType.DiscardCard: {
        notifyClient('discard_card', true, {})
        return true
      }
      case EventType.Overdraw: {
        notifyClient('overdraw', true, {})
        return true
      }
      case EventType.Fatigue: {
        notifyClient('fatigue', true, {})
        return true
      }
      case EventType.ChangeStats: {
        notifyClient('change_stats', true, {})
        return true
      }
      case EventType.EndTurn: {
        notifyClient('end_turn', true, {})
        return true
      }
      case EventType.HeroPower: {
        notifyClient('hero_power', true, {})
        return true
      }
    }
    return false
  }
}

export default Event
