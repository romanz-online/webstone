import Character from '@character'
import {
  CardLocation,
  CardType,
  EventType,
  Keyword,
  PlayerID,
} from '@constants'
import Effect from '@effect'
import { engine } from '@engine'
import { TryPlayMinionData, TryPlaySpellData } from '@eventInterfaces'
import AttackEvent from '@events/AttackEvent.ts'
import DrawCardEvent from '@events/DrawCardEvent.ts'
import EffectEvent from '@events/EffectEvent.ts'
import EndTurnEvent from '@events/EndTurnEvent.ts'
import PlayCardEvent from '@events/PlayCardEvent.ts'
import TriggerDeathEvent from '@events/TriggerDeathEvent.ts'
import EventStack from '@eventStack'
import { generateMinion } from '@generateMinion'
import HeroID from '@heroID' with { type: 'json' }
import Minion from '@minion'
import MinionID from '@minionID' with { type: 'json' }
import PlayerData from '@playerData'
import TryEndTurnEvent from '@tryEvents/TryEndTurnEvent.ts'
import TryPlayCardEvent from '@tryEvents/TryPlayCard.ts'
import { notifyClient } from '@ws'

const deck1: number[] = [
  MinionID.TIRION_FORDRING,
  MinionID.MANA_WYRM,
  MinionID.LIGHTWELL,
  MinionID.GUARDIAN_OF_KINGS,
  MinionID.FIRE_ELEMENTAL,
],
  deck2: number[] = []

export class GameInstance {
  player1: PlayerData
  player2: PlayerData
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

    this.whoseTurn = PlayerID.Player2
    this.eventStack = new EventStack()

    engine.on('done', () => {
      // NEED TO FIX THIS ASAP
      // this.checkHealth()
      if (!this.eventStack.isWaiting() && this.eventStack.length() > 0) {
        this.eventStack.executeStack()
      }
    })

    // EventType.TryEndTurn - No data required
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryEndTurn,
      (event, done) => {
        this.tryEndTurn()
        done()
      }
    )

    // EventType.TryCancel - No data required
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryCancel,
      (event, done) => {
        this.cancel()
        done()
      }
    )

    // EventType.TryTarget - Data required: { targetID: number }
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryTarget,
      (event, done) => {
        this.target(event.targetID)
        done()
      }
    )

    // EventType.TryLoad - No data required
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryLoad,
      (event, done) => {
        notifyClient(EventType.Load, true, this.toJSON())
        done()
      }
    )

    // EventType.TryPlayCard - Data required:
    // For Minions: { boardIndex: number, minionID: number, playerID: PlayerID }
    // For Spells: { cardID: number, playerID: PlayerID }
    // For Weapons: { cardID: number, playerID: PlayerID }
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryPlayCard,
      (event, done) => {
        this.tryPlayCard(event)
        done()
      }
    )

    // EventType.TryAttack - Data required: { attackerID: number, targetID: number }
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryAttack,
      (event, done) => {
        this.tryAttack(event.attackerID, event.targetID)
        done()
      }
    )

    // EventType.TryHeroPower - No data required (NOT IMPLEMENTED YET)
    engine.addGameElementListener(
      'gameInstance',
      EventType.TryHeroPower,
      (event, done) => {
        // NOT IMPLEMENTED YET
        done()
      }
    )
  }

  init(): any {
    for (let i = 0; i < 5; i++) {
      engine.queueEvent(new DrawCardEvent(PlayerID.Player1))
    }
    this.player2.board = [
      generateMinion(MinionID.CENARIUS, this.id(), PlayerID.Player2),
      generateMinion(MinionID.KORKRON_ELITE, this.id(), PlayerID.Player2),
      generateMinion(MinionID.SUMMONING_PORTAL, this.id(), PlayerID.Player2),
      generateMinion(MinionID.MANA_TIDE_TOTEM, this.id(), PlayerID.Player2),
      generateMinion(MinionID.ARATHI_WEAPONSMITH, this.id(), PlayerID.Player2),
    ]
    this.player2.board.forEach((m) => (m.location = CardLocation.Board))
    engine.queueEvent(new EndTurnEvent())
  }

  toJSON(): any {
    return {
      whoseTurn: this.whoseTurn,
      player1: this.player1.toJSON(),
      player2: this.player2.toJSON(),
    }
  }

  getUniqueID() {
    let counter = 0
    return function () {
      return counter++
    }
  }

  getPlayerData(id: PlayerID) {
    if (id === PlayerID.Player1) {
      return this.player1
    }
    return this.player2
  }

  flipWhoseTurn() {
    this.whoseTurn =
      this.whoseTurn === PlayerID.Player1 ? PlayerID.Player2 : PlayerID.Player1
  }

  cancel(): void {
    this.eventStack.clear()
    notifyClient(EventType.Cancel, true, {})
  }

  tryPlayCard(event: TryPlayCardEvent): void {
    const type: CardType = event.data.cardType
    switch (type) {
      case CardType.Minion:
        this.tryPlayMinion(event)
        break
      case CardType.Spell:
        this.tryPlaySpell(event)
        break
      case CardType.Weapon:
        this.tryPlayWeapon(event)
        break
      default:
        notifyClient(EventType.PlayCard, false, this.toJSON())
        console.error(`Invalid card type ${type}`)
        return
    }
  }

  tryPlayMinion(event: TryPlayCardEvent): void {
    // Type guard to ensure we have minion data
    if (event.data.cardType !== CardType.Minion) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error('Invalid card type for tryPlayMinion')
      return
    }

    const minionData = event.data as TryPlayMinionData
    const boardIndex: number = minionData.boardIndex,
      cardID: number = minionData.minionID,
      playerData: PlayerData = this.getPlayerData(minionData.playerID)

    const minion: Minion | null = this.getHandMinion(cardID)
    if (!minion) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Could not find minion with ID ${cardID} in hand`)
      return
    } else if (playerData.board.length === 7) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Board is full`)
      return
    }
    //  else if (minion.mana > playerData.getAvailableMana()) {
    //   notifyClient(EventType.PlayCard, false, this.toJSON())
    //   console.error(`Not enough mana to play ${minion}`)
    //   return
    // }

    this.eventStack.generateStack(
      new PlayCardEvent(playerData.playerID, minion, boardIndex)
    )
    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryPlaySpell(event: TryPlayCardEvent): void {
    // Type guard to ensure we have spell data
    if (event.data.cardType !== CardType.Spell) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error('Invalid card type for tryPlaySpell')
      return
    }

    const spellData = event.data as TryPlaySpellData
    const cardID: number = spellData.cardID,
      playerData: PlayerData = this.getPlayerData(spellData.playerID)

    const spell: Effect | null = this.getHandSpell(cardID)
    if (!spell) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Could not find spell with ID ${cardID} in hand`)
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

    this.eventStack.generateStack(
      new PlayCardEvent(playerData.playerID, spell, -1)
    )

    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryPlayWeapon(event: TryPlayCardEvent): void { }

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

    engine.queueEvent(new TriggerDeathEvent())
  }

  tryEndTurn(): void {
    this.whoseTurn =
      this.whoseTurn === PlayerID.Player1 ? PlayerID.Player2 : PlayerID.Player1

    engine.queueEvent(new EndTurnEvent())

    if (this.whoseTurn === PlayerID.Player2) {
      setTimeout(() => {
        engine.queuePlayerAction(new TryEndTurnEvent())
      }, 3 * 1000)
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

const Game = new GameInstance()
export default Game
