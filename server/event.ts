import { HeroClass, Rarity, Tribe, EffectType, EventType } from './constants'
import { notifyClient } from './ws'
import Minion from './minionData/minion'
import Effect from './effectData/effect'

export class Event {
  type: EventType
  data: any

  constructor(type: EventType, data: any) {
    this.type = type
    this.data = data
  }

  execute(): boolean {
    switch (this.type) {
      case EventType.PlayMinion: {
        this.data.hand.splice(this.data.hand.indexOf(this.data.minion), 1)[0]
        this.data.board.splice(this.data.boardIndex, 0, this.data.minion)
        this.data.minion.inPlay = true

        notifyClient('playMinion', true, {
          minion: this.data.minion,
        })
        // notifyClient('summonMinion', true, {
        //   minion: this.data.minion,
        // })
        return true
      }
      case EventType.SummonMinion: {
        this.data.hand.splice(this.data.hand.indexOf(this.data.minion), 1)[0]
        this.data.board.splice(this.data.boardIndex, 0, this.data.minion)
        this.data.minion.inPlay = true

        notifyClient('summonMinion', true, {
          minion: this.data.minion,
        })
        return true
      }
      case EventType.KillMinion: {
        notifyClient('killMinion', true, {
          minion: this.data.minion,
        })
        return true
      }
      case EventType.Attack: {
        const attacker: Minion = this.data.attacker,
          target: Minion = this.data.target
        if (!attacker.inPlay && !target.inPlay) {
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

        target.takeDamage(attacker, attacker.attack)
        notifyClient('applyDamage', true, {
          minion: attacker,
          damage: attacker.attack,
        })

        attacker.takeDamage(target, target.attack)
        notifyClient('applyDamage', true, {
          minion: target,
          damage: target.attack,
        })

        return true
      }
      case EventType.Spell: {
        const effect: Effect | null = this.data.spell
        if (!effect) {
          return false
        }

        effect.apply()

        notifyClient('spell', true, {})
        return true
      }
      case EventType.Battlecry: {
        const effect: Effect | null = this.data.minion.effects.battlecry
        if (!effect) {
          return false
        }

        effect.apply()

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
      case EventType.Damage: {
        notifyClient('damage', true, {})
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
