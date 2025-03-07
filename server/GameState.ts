import { engine } from '@engine'
import { notifyClient } from '@ws'
import Event from '@event'
import EventStack from '@eventStack'
import { CardType, EventType, PlayerID } from '@constants'
import Card from '@card'
import Character from '@character'
import Hero from '@hero'
import Minion from '@minion'
import Effect from '@effect'
import HeroID from '@heroID'
import MinionID from '@minionID'
import { generateHero } from '@generateHero'
import { generateMinion } from '@generateMinion'
import { generateEffect } from '@generateEffect'
import { handleError } from '@errorHandler'

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
  player1: Hero
  player2: Hero
  player1Fatigue: number
  player2Fatigue: number

  constructor() {
    this.uniqueMinionNumber = 0

    this.player1 = generateHero(
      HeroID.JAINA_PROUDMOORE,
      this.getUniqueID(),
      PlayerID.Player1
    )

    this.player2 = generateHero(
      HeroID.HOGGER,
      this.getUniqueID(),
      PlayerID.Player2
    )

    this.player1Fatigue = 0
    this.player2Fatigue = 0

    this.graveyard = []
    this.playerDeck = []
    this.opponentDeck = []
    this.playerHand = []
    this.opponentHand = []
    this.playerBoard = []
    this.opponentBoard = [
      generateMinion(MinionID.CENARIUS, this.getUniqueID(), PlayerID.Player2),
      generateMinion(
        MinionID.KORKRON_ELITE,
        this.getUniqueID(),
        PlayerID.Player2
      ),
      generateMinion(
        MinionID.SUMMONING_PORTAL,
        this.getUniqueID(),
        PlayerID.Player2
      ),
      generateMinion(
        MinionID.MANA_TIDE_TOTEM,
        this.getUniqueID(),
        PlayerID.Player2
      ),
      generateMinion(
        MinionID.ARATHI_WEAPONSMITH,
        this.getUniqueID(),
        PlayerID.Player2
      ),
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

    engine.addGameElementListener(
      'gameState',
      EventType.TrySpell,
      (data, done) => {
        done()
      }
    )

    engine.queueEvent([new Event(EventType.EndTurn, {})])
  }

  toJSON(): any {
    return {
      playerDeck: this.playerDeck,
      opponentDeck: this.opponentDeck,
      playerHealth: this.player1.health,
      opponentHealth: this.player2.health,
      playerHand: this.playerHand,
      opponentHand: this.opponentHand,
      playerBoard: this.playerBoard,
      opponentBoard: this.opponentBoard,
      whoseTurn: this.whoseTurn,
    }
  }

  getUniqueID(): number {
    return this.uniqueMinionNumber++
  }

  startGame(): void {
    this.playerDeck = playerDeckStorage.map((id) => {
      if (id >= 2000) {
        return generateEffect(id, this.getUniqueID(), PlayerID.Player1)
      } else if (id >= 1000) {
        return generateMinion(id, this.getUniqueID(), PlayerID.Player1)
      }
    })

    this.opponentDeck = opponentDeckStorage.map((id) => {
      if (id >= 2000) {
        return generateEffect(id, this.getUniqueID(), PlayerID.Player2)
      } else if (id >= 1000) {
        return generateMinion(id, this.getUniqueID(), PlayerID.Player2)
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
        {
          const player: number = data.player,
            boardIndex: number = data.boardIndex,
            uniqueID: number = data.uniqueID

          const minion: Minion | null = this.getHandMinion(uniqueID)
          if (!minion) {
            notifyClient(EventType.PlayCard, false, this.toJSON())
            console.error(`Could not find minion with ID ${uniqueID} in hand`)
            return
          }

          // DO MORE ERROR CHECKS
          // notifyClient('playMinion', false, this.toJSON())

          const hand =
              player === PlayerID.Player1 ? this.playerHand : this.opponentHand,
            board =
              player === PlayerID.Player1
                ? this.playerBoard
                : this.opponentBoard
          this.eventStack.push(
            new Event(EventType.PlayCard, {
              hand: hand,
              board: board,
              minion: minion,
              boardIndex: boardIndex,
            })
          )

          if (this.eventStack.isWaiting()) {
            notifyClient(EventType.Target, true, {})
          }
        }
        break
      case CardType.Spell:
        {
          const player: number = data.player,
            uniqueID: number = data.uniqueID

          const spell: Effect | null = this.getHandSpell(uniqueID)
          if (!spell) {
            notifyClient(EventType.PlayCard, false, this.toJSON())
            console.error(`Could not find minion with ID ${uniqueID} in hand`)
            return
          }
        }
        break
      case CardType.Weapon:
        {
        }
        break
      default: {
        notifyClient(EventType.PlayCard, false, this.toJSON())
        console.error(`Invalid card type ${type}`)
        return
      }
    }
  }

  target(targetID: number): void {
    const target: Minion | null = this.getBoardCharacter(targetID)

    if (!target) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    } else if (!this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No card is waiting for a target')
      return
    }

    const event = this.eventStack.getTop()
    if (!event) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No events are queued in the stack')
      return
    }
    const minion: Minion | null = event.data.minion
    if (!minion) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No minion in stacked event')
      return
    }
    const effect: Effect | null = minion.getBattlecry()
    if (!effect || !effect.canTarget) {
      notifyClient(EventType.Target, false, this.toJSON())
      console.error('No effect is waiting for a target')
      return
    }
    effect.gameState = this

    this.eventStack.push(
      new Event(EventType.Battlecry, {
        effect: effect,
        source: minion,
        target: target,
      })
    )

    if (this.eventStack.isWaiting()) {
      notifyClient(EventType.Target, true, {})
    }
  }

  tryAttack(attackerID: number, targetID: number): void {
    const attacker: Minion | null = this.getBoardCharacter(attackerID),
      target: Minion | null = this.getBoardCharacter(targetID)

    // IMPLEMENT THIS FOR THE OTHER FUNCTIONS
    if (
      handleError({
        attackerID: attackerID,
        targetID: targetID,
        attacker: attacker,
        target: target,
        opponentBoard: this.opponentBoard,
      })
    ) {
      return
    }

    engine.queueEvent([
      new Event(EventType.Attack, {
        attacker: attacker,
        target: target,
      }),
    ])
  }

  checkHealth(): void {
    if (this.player1.health < 1 && this.player2.health > 0) {
      // kill player hero
      return
    } else if (this.player2.health < 1 && this.player1.health > 0) {
      // kill opponent
      return
    } else if (this.player1.health < 1 && this.player2.health < 1) {
      // tie
      return
    }

    let ret = false
    for (let i = this.playerBoard.length - 1; i >= 0; i--) {
      if (this.playerBoard[i].health < 1) {
        this.graveyard.push(this.playerBoard[i])
        this.playerBoard.splice(i, 1)
        ret = true
      }
    }
    for (let i = this.opponentBoard.length - 1; i >= 0; i--) {
      if (this.opponentBoard[i].health < 1) {
        this.graveyard.push(this.opponentBoard[i])
        this.opponentBoard.splice(i, 1)
        ret = true
      }
    }

    if (ret) {
      engine.queueEvent([new Event(EventType.Kill, {})])
    }
  }

  onEndTurn(): void {
    // engine.queueEvent([new Event(EventType.EndTurn, {})])

    for (const minion of this.playerBoard) {
      minion.canAttack = !minion.canAttack
    }
    for (const minion of this.opponentBoard) {
      minion.canAttack = !minion.canAttack
    }

    this.whoseTurn =
      this.whoseTurn === PlayerID.Player1 ? PlayerID.Player2 : PlayerID.Player1

    if (this.whoseTurn === PlayerID.Player2) {
      this.simulateOpponentTurn()
    }
  }

  simulateOpponentTurn(): void {
    setTimeout(() => {
      engine.queueEvent([new Event(EventType.EndTurn, {})])
    }, 2 * 1000)
  }

  // GOING TO NEED TO MODIFY THESE METHODS AT THE BOTTOM TO ALSO ACCOUNT FOR HEROES
  // SOMETHING LIKE "getBoardCharacter"

  getBoardCharacter(uniqueID: number): Character | null {
    if (this.player1.uniqueID === uniqueID) return this.player1
    else if (this.player2.uniqueID === uniqueID) return this.player2

    for (const x of this.playerBoard) {
      if (x.uniqueID === uniqueID) return x
    }
    for (const x of this.opponentBoard) {
      if (x.uniqueID === uniqueID) return x
    }
    return null
  }

  getHandMinion(uniqueID: number): Minion | null {
    for (const x of this.playerHand) {
      if (x.uniqueID === uniqueID && x instanceof Minion) return x
    }
    for (const x of this.opponentHand) {
      if (x.uniqueID === uniqueID && x instanceof Minion) return x
    }
    return null
  }

  getHandSpell(uniqueID: number): Effect | null {
    for (const x of this.playerHand) {
      if (x.uniqueID === uniqueID && x instanceof Effect) return x
    }
    for (const x of this.opponentHand) {
      if (x.uniqueID === uniqueID && x instanceof Effect) return x
    }
    return null
  }
}

export default GameState
