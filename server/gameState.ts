import { engine } from './Engine'
import { notifyClient } from './ws'
import { generateMinion } from './minionData/generateMinion'
import MINION_ID from './minionData/minionID.json'
import Minion from './minionData/minion'
import Effect from './effectData/effect'
import EventStack from './EventStack'
import Event from './event'
import { EventType, PlayerID } from './constants'

const playerDeckStorage: number[] = [
    MINION_ID.TIRION_FORDRING,
    MINION_ID.MANA_WYRM,
    MINION_ID.LIGHTWELL,
    MINION_ID.GUARDIAN_OF_KINGS,
    MINION_ID.FIRE_ELEMENTAL,
  ],
  opponentDeckStorage: number[] = []

class GameState {
  uniqueMinionNumber: number
  playerHealth: number
  opponentHealth: number
  graveyard: Minion[]
  playerDeck: Minion[]
  opponentDeck: Minion[]
  playerHand: Minion[]
  opponentHand: Minion[]
  playerBoard: Minion[]
  opponentBoard: Minion[]
  whoseTurn: number
  eventStack: EventStack

  constructor() {
    this.uniqueMinionNumber = 0

    this.playerHealth = 20
    this.opponentHealth = 10

    this.graveyard = []
    this.playerDeck = []
    this.opponentDeck = []
    this.playerHand = []
    this.opponentHand = []
    this.playerBoard = []
    this.opponentBoard = [
      generateMinion(MINION_ID.CENARIUS, this.getUniqueID(), PlayerID.Player2),
      generateMinion(
        MINION_ID.KORKRON_ELITE,
        this.getUniqueID(),
        PlayerID.Player2
      ),
      generateMinion(
        MINION_ID.SUMMONING_PORTAL,
        this.getUniqueID(),
        PlayerID.Player2
      ),
      generateMinion(
        MINION_ID.MANA_TIDE_TOTEM,
        this.getUniqueID(),
        PlayerID.Player2
      ),
      generateMinion(
        MINION_ID.ARATHI_WEAPONSMITH,
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

    engine.on('done', () => this.checkHealth)

    engine.addGameElementListener(
      'gameState', // TRY CHANGING THIS TO "this"
      EventType.PlayMinion, // AND GET RID OF THIS. JUST HAVE engine DIRECTLY EXECUTE LISTENERS WITH this.listener(data, done)
      (data, done) => {
        this.playMinion(data.boardIndex, data.uniqueID)
        done()
      }
    )

    engine.addGameElementListener(
      'gameState',
      EventType.Attack,
      (data, done) => {
        this.tryAttack(data.attackerID, data.targetID)
        done()
      }
    )

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

    engine.queueEvent([new Event(EventType.EndTurn, {})])
  }

  toJSON(): any {
    return {
      playerDeck: this.playerDeck,
      opponentDeck: this.opponentDeck,
      playerHealth: this.playerHealth,
      opponentHealth: this.opponentHealth,
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
    this.playerDeck = playerDeckStorage.map((minion) =>
      generateMinion(minion, this.getUniqueID(), PlayerID.Player1)
    )

    this.opponentDeck = opponentDeckStorage.map((minion) =>
      generateMinion(minion, this.getUniqueID(), PlayerID.Player2)
    )

    const shuffleDeck = (deck) => {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
      }
    }

    shuffleDeck(this.playerDeck)
    shuffleDeck(this.opponentDeck)
  }

  drawCard(player: number): void {
    if (player === PlayerID.Player1) {
      const card = this.playerDeck.pop()
      if (card) {
        console.log('player draws a card')
        this.playerHand.push(card)
        notifyClient('drawCard', true, this.toJSON())
      } else {
        console.log('player overdraws')
      }
    } else if (player === PlayerID.Player2) {
      const card = this.opponentDeck.pop()
      if (card) {
        console.log('opponent draws a card')
        this.opponentHand.push(card)
        notifyClient('drawCard', true, this.toJSON())
      } else {
        console.log('opponent overdraws')
      }
    } else {
      console.error('unknown player ID')
    }
  }

  cancel(): void {
    this.eventStack.clear()
    notifyClient('cancel', true, {})
  }

  playMinion(boardIndex: number, uniqueID: number): void {
    const minion: Minion | null = this.getHandMinion(uniqueID)

    if (!minion) {
      notifyClient('playMinion', false, this.toJSON())
      console.error(`Could not find minion with ID ${uniqueID} in hand`)
      return
    }

    // DO MORE ERROR CHECKS
    // notifyClient('playMinion', false, this.toJSON())

    const needPlayerInput = this.eventStack.push(
      new Event(EventType.PlayMinion, {
        minion: minion,
        boardIndex: boardIndex,
      })
    )

    if (needPlayerInput) {
      notifyClient('getTarget', true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  target(targetID: number): void {
    const target: Minion | null = this.getBoardMinion(targetID)

    if (!target) {
      notifyClient('target', false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    } else if (!this.eventStack.isWaiting()) {
      notifyClient('target', false, this.toJSON())
      console.error('No card is waiting for a target')
      return
    }

    const event = this.eventStack.getTop()
    if (!event) {
      notifyClient('target', false, this.toJSON())
      console.error('No events are queued in the stack')
      return
    }
    const minion: Minion | null = event.data.minion
    if (!minion) {
      notifyClient('target', false, this.toJSON())
      console.error('No minion in stacked event')
      return
    }
    const effect: Effect | null = minion.getBattlecry()
    if (!effect || !effect.canTarget) {
      notifyClient('target', false, this.toJSON())
      console.error('No effect is waiting for a target')
      return
    }
    effect.gameState = this

    const needPlayerInput = this.eventStack.push(
      new Event(EventType.Battlecry, {
        effect: effect,
        source: minion,
        target: target,
      })
    )

    if (needPlayerInput) {
      notifyClient('getTarget', true, {})
    } else {
      this.eventStack.executeStack()
    }
  }

  tryAttack(attackerID: number, targetID: number): void {
    const attacker: Minion | null = this.getBoardMinion(attackerID),
      target: Minion | null = this.getBoardMinion(targetID)

    if (!attacker) {
      notifyClient('tryAttack', false, this.toJSON())
      console.error('Could not find attacker with ID', attackerID, 'on board')
      return
    } else if (!target) {
      notifyClient('tryAttack', false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    } else if (!attacker.canAttack) {
      notifyClient('tryAttack', false, this.toJSON())
      console.error('Minion cannot attack')
      return
    } else if (!target.taunt && this.opponentBoard.some((m) => m.taunt)) {
      notifyClient('tryAttack', false, this.toJSON())
      console.error('Taunt is in the way')
      return
    }

    // notifyClient('attack', true, {
    //   attacker: attacker,
    //   target: target,
    // })

    // QUEUE ATTACK EVENT

    // DO ATTACK
  }

  checkHealth(): void {
    if (this.playerHealth < 1 && this.opponentHealth > 0) {
      // kill player hero
      return
    } else if (this.opponentHealth < 1 && this.playerHealth > 0) {
      // kill opponent
      return
    } else if (this.playerHealth < 1 && this.opponentHealth < 1) {
      // tie
      return
    }

    let ret = false
    this.playerBoard = this.playerBoard.filter((m) => {
      if (m.health < 1) {
        this.graveyard.push(m)
        ret = true
        return false
      }
      return true
    })
    this.opponentBoard = this.opponentBoard.filter((m) => {
      if (m.health < 1) {
        this.graveyard.push(m)
        ret = true
        return false
      }
      return true
    })

    if (ret) {
      engine.queueEvent([new Event(EventType.KillMinion, {})])
    }
  }

  onEndTurn(): void {
    ;[...this.playerBoard, ...this.opponentBoard].forEach((m) => {
      m.canAttack = !m.canAttack
    })

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

  getBoardMinion(uniqueID: number): Minion | null {
    return (
      [...this.playerBoard, ...this.opponentBoard].find(
        (minion) => minion.uniqueID === uniqueID
      ) || null
    )
  }

  getHandMinion(uniqueID: number): Minion | null {
    return (
      [...this.playerHand, ...this.opponentHand].find(
        (minion) => minion.uniqueID === uniqueID
      ) || null
    )
  }
}

export default GameState
