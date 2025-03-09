import { engine } from '@engine'
import { notifyClient } from '@ws'
import Event from 'eventData/Event.ts'
import EventStack from '@eventStack'
import { CardType, EventType, Keyword, PlayerID } from '@constants'
import Card from '@card'
import Character from '@character'
import Hero from '@hero'
import Minion from '@minion'
import Effect from '@effect'
import HeroID from '@heroID' with { type: 'json' }
import MinionID from '@minionID' with { type: 'json' }
import { generateHero } from '@generateHero'
import { generateMinion } from '@generateMinion'
import { generateEffect } from '@generateEffect'
import PlayCardEvent from '@events/PlayCardEvent.ts'
import SummonMinionEvent from '@events/SummonMinionEvent.ts'
import EffectEvent from '@events/EffectEvent.ts'
import EndTurnEvent from '@events/EndTurnEvent.ts'
import TriggerDeathEvent from '@events/TriggerDeathEvent.ts'
import AttackEvent from '@events/AttackEvent.ts'

const playerDeckStorage: number[] = [
    MinionID.TIRION_FORDRING,
    MinionID.MANA_WYRM,
    MinionID.LIGHTWELL,
    MinionID.GUARDIAN_OF_KINGS,
    MinionID.FIRE_ELEMENTAL,
  ],
  opponentDeckStorage: number[] = []

class GameState {
  uniqueMinionNumber: number
  graveyard: Minion[]
  playerDeck: Card[]
  opponentDeck: Card[]
  playerHand: Card[]
  opponentHand: Card[]
  playerBoard: Minion[]
  opponentBoard: Minion[]
  whoseTurn: PlayerID
  eventStack: EventStack
  player1Hero: Hero
  player2Hero: Hero
  player1Fatigue: number
  player2Fatigue: number
  id: () => number

  constructor() {
    this.id = this.getUniqueID()

    this.player1Hero = generateHero(
      HeroID.JAINA_PROUDMOORE,
      this.id(),
      PlayerID.Player1
    )

    this.player2Hero = generateHero(HeroID.HOGGER, this.id(), PlayerID.Player2)

    this.player1Fatigue = 0
    this.player2Fatigue = 0

    this.graveyard = []
    this.playerDeck = []
    this.opponentDeck = []
    this.playerHand = []
    this.opponentHand = []
    this.playerBoard = []
    this.opponentBoard = [
      generateMinion(MinionID.CENARIUS, this.id(), PlayerID.Player2),
      generateMinion(MinionID.KORKRON_ELITE, this.id(), PlayerID.Player2),
      generateMinion(MinionID.SUMMONING_PORTAL, this.id(), PlayerID.Player2),
      generateMinion(MinionID.MANA_TIDE_TOTEM, this.id(), PlayerID.Player2),
      generateMinion(MinionID.ARATHI_WEAPONSMITH, this.id(), PlayerID.Player2),
    ]
    this.opponentBoard.forEach((m) => (m.inPlay = true))

    this.whoseTurn = PlayerID.Player2
    this.eventStack = new EventStack()

    this.startGame()

    this.drawCard(PlayerID.Player1)
    this.drawCard(PlayerID.Player1)
    this.drawCard(PlayerID.Player1)
    this.drawCard(PlayerID.Player1)
    this.drawCard(PlayerID.Player1)

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

    engine.queueEvent(
      new EndTurnEvent(
        this.player1Hero,
        this.player2Hero,
        this.playerBoard,
        this.opponentBoard
      )
    )
  }

  toJSON(): any {
    return {
      playerDeck: this.playerDeck,
      opponentDeck: this.opponentDeck,
      playerHealth: this.player1Hero.health,
      opponentHealth: this.player2Hero.health,
      playerHand: this.playerHand,
      opponentHand: this.opponentHand,
      playerBoard: this.playerBoard,
      opponentBoard: this.opponentBoard,
      whoseTurn: this.whoseTurn,
    }
  }

  getUniqueID() {
    let counter = 0
    return function () {
      return counter++
    }
  }

  startGame(): void {
    this.playerDeck = playerDeckStorage.map((baseID) => {
      if (baseID >= 2000) {
        return generateEffect(baseID, this.id(), PlayerID.Player1)
      } else if (baseID >= 1000) {
        return generateMinion(baseID, this.id(), PlayerID.Player1)
      }
    })

    this.opponentDeck = opponentDeckStorage.map((baseID) => {
      if (baseID >= 2000) {
        return generateEffect(baseID, this.id(), PlayerID.Player2)
      } else if (baseID >= 1000) {
        return generateMinion(baseID, this.id(), PlayerID.Player2)
      }
    })

    const shuffleDeck = (deck: any) => {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
      }
    }

    shuffleDeck(this.playerDeck)
    shuffleDeck(this.opponentDeck)
  }

  drawCard(player: PlayerID): void {
    if (player === PlayerID.Player1) {
      const card = this.playerDeck.pop()
      if (card) {
        console.log('player draws a card')
        this.playerHand.push(card)
        notifyClient(EventType.DrawCard, true, this.toJSON())
      } else {
        console.log('player overdraws')
      }
    } else if (player === PlayerID.Player2) {
      const card = this.opponentDeck.pop()
      if (card) {
        console.log('opponent draws a card')
        this.opponentHand.push(card)
        notifyClient(EventType.DrawCard, true, this.toJSON())
      } else {
        console.log('opponent overdraws')
      }
    } else {
      console.error('unknown player ID')
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
    const player: PlayerID = data.player,
      boardIndex: number = data.boardIndex,
      id: number = data.id,
      hero: Hero =
        player === PlayerID.Player1 ? this.player1Hero : this.player2Hero,
      hand: Card[] =
        player === PlayerID.Player1 ? this.playerHand : this.opponentHand,
      board: Minion[] =
        player === PlayerID.Player1 ? this.playerBoard : this.opponentBoard

    const minion: Minion | null = this.getHandMinion(id)
    if (!minion) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Could not find minion with ID ${id} in hand`)
      return
    } else if (board.length === 7) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Board is full`)
      return
    } else if (minion.mana > hero.manaAvailable) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Not enough mana to play ${minion}`)
      return
    }

    this.eventStack.push(
      new PlayCardEvent(player, hand, board, minion, boardIndex)
    )
    this.eventStack.push(new SummonMinionEvent(board, minion, boardIndex))

    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryPlaySpell(data: any): void {
    const player: PlayerID = data.player,
      id: number = data.id,
      hero: Hero =
        player === PlayerID.Player1 ? this.player1Hero : this.player2Hero

    const spell: Effect | null = this.getHandSpell(id)
    if (!spell) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Could not find spell with ID ${id} in hand`)
      return
    } else if (spell.manaCost > hero.manaAvailable) {
      notifyClient(EventType.PlayCard, false, this.toJSON())
      console.error(`Not enough mana to play ${spell}`)
      return
    }

    // USE A METHOD ON THE SPELL TO DETERMINE IF THERE ARE ANY VALID TARGETS AT ALL
    // availableTargets(): Character[] { }

    this.eventStack.push(new PlayCardEvent(player, null, null, spell, -1))

    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryPlayWeapon(data: any): void {}

  target(targetID: number): void {
    const target: Character | null = this.getBoardCharacter(targetID)

    if (!target) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    } else if (!this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No card is waiting for a target')
      return
    }

    // MODIFY THIS TO ACCOUNT FOR SPELLS
    // START HERE AND IN EventStack
    const event: PlayCardEvent = this.eventStack.getBottom()
    if (!event) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No events are queued in the stack')
      return
    }
    const card: Card | null = event.card
    if (!card) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No card in stacked event')
      return
    }

    if (card instanceof Minion) {
      const effect: Effect | null = card.getBattlecry()
      if (!effect || !effect.canTarget) {
        notifyClient(EventType.Target, false, this.toJSON())
        console.error('No effect is waiting for a target')
        return
      }

      this.eventStack.push(new EffectEvent(effect, card, target))
    } else if (card instanceof Effect) {
      this.eventStack.push(new EffectEvent(card, this.player1Hero, target))
    } else {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('Unrecognized card type')
      return
    }

    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    } else {
      this.eventStack.executeStack()
    }
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
      this.opponentBoard.some((m) => m.hasKeyword(Keyword.Taunt))
    ) {
      notifyClient(EventType.TryAttack, false, this.toJSON())
      console.error('Taunt is in the way')
      return
    }

    engine.queueEvent(new AttackEvent(attacker, target))
  }

  checkHealth(): void {
    if (this.player1Hero.health < 1 && this.player2Hero.health > 0) {
      // kill player hero
      return
    } else if (this.player2Hero.health < 1 && this.player1Hero.health > 0) {
      // kill opponent
      return
    } else if (this.player1Hero.health < 1 && this.player2Hero.health < 1) {
      // tie
      return
    }

    engine.queueEvent(
      new TriggerDeathEvent(
        this.playerBoard,
        this.opponentBoard,
        this.graveyard
      )
    )
  }

  onEndTurn(): void {
    // engine.queueEvent([new Event(EventType.EndTurn, {})])

    this.whoseTurn =
      this.whoseTurn === PlayerID.Player1 ? PlayerID.Player2 : PlayerID.Player1

    if (this.whoseTurn === PlayerID.Player2) {
      setTimeout(() => {
        engine.queueEvent(
          new EndTurnEvent(
            this.player1Hero,
            this.player2Hero,
            this.playerBoard,
            this.opponentBoard
          )
        )
      }, 2 * 1000)
    }
  }

  getBoardCharacter(id: number): Character | null {
    if (this.player1Hero.id === id) return this.player1Hero
    else if (this.player2Hero.id === id) return this.player2Hero

    for (const x of this.playerBoard) {
      if (x.id === id) return x
    }
    for (const x of this.opponentBoard) {
      if (x.id === id) return x
    }
    return null
  }

  getHandMinion(id: number): Minion | null {
    for (const x of this.playerHand) {
      if (x.id === id && x instanceof Minion) return x
    }
    for (const x of this.opponentHand) {
      if (x.id === id && x instanceof Minion) return x
    }
    return null
  }

  getHandSpell(id: number): Effect | null {
    for (const x of this.playerHand) {
      if (x.id === id && x instanceof Effect) return x
    }
    for (const x of this.opponentHand) {
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
