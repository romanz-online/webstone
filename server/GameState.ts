import Character from '@character'
import { CardType, EventType, Keyword, PlayerID } from '@constants'
import Effect from '@effect'
import { engine } from '@engine'
import AttackEvent from '@events/AttackEvent.ts'
import DrawCardEvent from '@events/DrawCardEvent.ts'
import EffectEvent from '@events/EffectEvent.ts'
import EndTurnEvent from '@events/EndTurnEvent.ts'
import PlayCardEvent from '@events/PlayCardEvent.ts'
import TriggerDeathEvent from '@events/TriggerDeathEvent.ts'
import EventStack from '@eventStack'
import HeroID from '@heroID' with { type: 'json' }
import Minion from '@minion'
import MinionID from '@minionID' with { type: 'json' }
import PlayerData from '@playerData'
import { notifyClient } from '@ws'

const deck1: number[] = [
    MinionID.TIRION_FORDRING,
    MinionID.MANA_WYRM,
    MinionID.LIGHTWELL,
    MinionID.GUARDIAN_OF_KINGS,
    MinionID.FIRE_ELEMENTAL,
  ],
  deck2: number[] = []

class GameState {
  player1: PlayerData
  player2: PlayerData
  graveyard: Minion[]
  whoseTurn: PlayerID
  eventStack: EventStack
  id: () => number

  constructor() {
    this.id = this.getUniqueID()

    this.player1 = new PlayerData(
      HeroID.JAINA_PROUDMOORE,
      deck1,
      PlayerID.Player1,
      this.id
    )
    this.player2 = new PlayerData(
      HeroID.HOGGER,
      deck2,
      PlayerID.Player2,
      this.id
    )

    this.graveyard = []
    this.whoseTurn = PlayerID.Player2
    this.eventStack = new EventStack(this.player1, this.player2)

    for (let i = 0; i < 5; i++) {
      engine.queueEvent(new DrawCardEvent(this.player1))
    }

    engine.on('done', () => {
      this.checkHealth()
      if (!this.eventStack.isWaiting() && this.eventStack.length() > 0) {
        this.eventStack.executeStack()
      }
    })

    engine.addGameElementListener(
      'gameState',
      EventType.EndTurn,
      (data, done) => {
        this.onEndTurn()
        done()
      }
    )

    engine.addGameElementListener(
      'gameState',
      EventType.Cancel,
      (data, done) => {
        this.cancel()
        done()
      }
    )

    engine.addGameElementListener(
      'gameState',
      EventType.Target,
      (data, done) => {
        this.target(data.targetID)
        done()
      }
    )

    engine.addGameElementListener('gameState', EventType.Load, (data, done) => {
      notifyClient(EventType.Load, true, this.toJSON())
      done()
    })

    engine.addGameElementListener(
      'gameState',
      EventType.TryPlayCard,
      (data, done) => {
        this.tryPlayCard(data.type, data)
        done()
      }
    )

    engine.addGameElementListener(
      'gameState',
      EventType.TryAttack,
      (data, done) => {
        this.tryAttack(data.attackerID, data.targetID)
        done()
      }
    )

    engine.queueEvent(new EndTurnEvent(this.player1, this.player2))
  }

  toJSON(): any {
    return {
      whoseTurn: this.whoseTurn,
    }
  }

  getUniqueID() {
    let counter = 0
    return function () {
      return counter++
    }
  }

  cancel(): void {
    this.eventStack.clear()
    notifyClient(EventType.Cancel, true, {})
  }

  tryPlayCard(type: CardType, data: any): void {
    switch (type) {
      case CardType.Minion:
        this.tryPlayMinion(data)
        break
      case CardType.Spell:
        this.tryPlaySpell(data)
        break
      case CardType.Weapon:
        this.tryPlayWeapon(data)
        break
      default:
        notifyClient(EventType.PlayCard, false, this.toJSON())
        console.error(`Invalid card type ${type}`)
        return
    }
  }

  tryPlayMinion(data: any): void {
    const boardIndex: number = data.boardIndex,
      id: number = data.id,
      playerData: PlayerData =
        data.player === PlayerID.Player1 ? this.player1 : this.player2

    const minion: Minion | null = this.getHandMinion(id)
    if (!minion) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Could not find minion with ID ${id} in hand`)
      return
    } else if (playerData.board.length === 7) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Board is full`)
      return
    } else if (minion.mana > playerData.getAvailableMana()) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Not enough mana to play ${minion}`)
      return
    }

    this.eventStack.generateStack(
      new PlayCardEvent(playerData, minion, boardIndex)
    )
    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryPlaySpell(data: any): void {
    const id: number = data.id,
      playerData: PlayerData =
        data.player === PlayerID.Player1 ? this.player1 : this.player2

    const spell: Effect | null = this.getHandSpell(id)
    if (!spell) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Could not find spell with ID ${id} in hand`)
      return
    } else if (spell.manaCost > playerData.getAvailableMana()) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Not enough mana to play ${spell}`)
      return
    } else if (
      spell.canTarget &&
      spell.requiresTarget &&
      spell.availableTargets(this.player1, this.player2).length === 0
    ) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`No available targets for ${spell}`)
      return
    }

    // MAYBE ALSO SEPARATE SPELLS AND BATTLECRIES AFTER ALL? NOT SURE, HONESTLY...
    // NEED TO RETHINK THIS

    this.eventStack.generateStack(new PlayCardEvent(playerData, spell, -1))

    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryPlayWeapon(data: any): void {}

  target(targetID: number): void {
    const target: Character | null = this.getBoardCharacter(targetID),
      event: EffectEvent = this.eventStack.getStackedEffect()

    if (!target) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    } else if (!event) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No events queued in stack')
      return
    } else if (!this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No card is waiting for a target')
      return
    }

    event.target = target
    this.eventStack.executeStack()
  }

  tryAttack(attackerID: number, targetID: number): void {
    const attacker: Character | null = this.getBoardCharacter(attackerID),
      target: Character | null = this.getBoardCharacter(targetID)

    if (!attacker) {
      notifyClient(EventType.TryAttack, false, this.toJSON())
      console.error(`Could not find attacker with ID ${attackerID} on board`)
      return
    } else if (!target) {
      notifyClient(EventType.TryAttack, false, this.toJSON())
      console.error(`Could not find target with ID ${targetID} on board`)
      return
    } else if (!attacker.canAttack) {
      notifyClient(EventType.TryAttack, false, this.toJSON())
      console.error(`Minion ${attacker} cannot attack`)
      return
    } else if (
      !target.hasKeyword(Keyword.Taunt) &&
      this.player2.board.some((m) => m.hasKeyword(Keyword.Taunt))
    ) {
      notifyClient(EventType.TryAttack, false, this.toJSON())
      console.error('Taunt is in the way')
      return
    }

    engine.queueEvent(new AttackEvent(attacker, target))
  }

  checkHealth(): void {
    if (this.player1.hero.health < 1 && this.player2.hero.health > 0) {
      // kill player hero
      return
    } else if (this.player2.hero.health < 1 && this.player1.hero.health > 0) {
      // kill opponent
      return
    } else if (this.player1.hero.health < 1 && this.player2.hero.health < 1) {
      // tie
      return
    }

    engine.queueEvent(
      new TriggerDeathEvent(this.player1, this.player2, this.graveyard)
    )
  }

  onEndTurn(): void {
    this.whoseTurn =
      this.whoseTurn === PlayerID.Player1 ? PlayerID.Player2 : PlayerID.Player1

    if (this.whoseTurn === PlayerID.Player2) {
      setTimeout(() => {
        engine.queueEvent(new EndTurnEvent(this.player1, this.player2))
      }, 2 * 1000)
    }
  }

  getBoardCharacter(id: number): Character | null {
    if (this.player1.hero.id === id) return this.player1.hero
    else if (this.player2.hero.id === id) return this.player2.hero

    for (const x of this.player1.board) {
      if (x.id === id) return x
    }
    for (const x of this.player2.board) {
      if (x.id === id) return x
    }
    return null
  }

  getHandMinion(id: number): Minion | null {
    for (const x of this.player1.hand) {
      if (x.id === id && x instanceof Minion) return x
    }
    for (const x of this.player2.hand) {
      if (x.id === id && x instanceof Minion) return x
    }
    return null
  }

  getHandSpell(id: number): Effect | null {
    for (const x of this.player1.hand) {
      if (x.id === id && x instanceof Effect) return x
    }
    for (const x of this.player2.hand) {
      if (x.id === id && x instanceof Effect) return x
    }
    return null
  }

  // getHandWeapon(id: number): Weapon | null {
  //   for (const x of this.playerHand) {
  //     if (x.id === id && x instanceof Weapon) return x
  //   }
  //   for (const x of this.opponentHand) {
  //     if (x.id === id && x instanceof Weapon) return x
  //   }
  //   return null
  // }
}

export default GameState
