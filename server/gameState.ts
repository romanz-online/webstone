import { engine } from './engine'
import { notifyClient } from './ws'
import { generateMinion } from './minionData/generateMinion'
import MINION_ID from './minionData/minionID.json'
import Minion from './minionData/minion'
import Effect from './effectData/effect'
import EffectStack from './effectStack'

const playerDeckStorage: number[] = [
    MINION_ID.TIRION_FORDRING,
    MINION_ID.MANA_WYRM,
    MINION_ID.LIGHTWELL,
    MINION_ID.GUARDIAN_OF_KINGS,
    MINION_ID.FIRE_ELEMENTAL,
  ],
  opponentDeckStorage: number[] = []

const PLAYER_ID: number = -1,
  OPPONENT_ID: number = -2

export class GameState {
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
  effectStack: EffectStack

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
      generateMinion(MINION_ID.CENARIUS, this.getUniqueID(), OPPONENT_ID),
      generateMinion(MINION_ID.KORKRON_ELITE, this.getUniqueID(), OPPONENT_ID),
      generateMinion(
        MINION_ID.SUMMONING_PORTAL,
        this.getUniqueID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_ID.MANA_TIDE_TOTEM,
        this.getUniqueID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_ID.ARATHI_WEAPONSMITH,
        this.getUniqueID(),
        OPPONENT_ID
      ),
    ]

    this.opponentBoard.forEach((m) => (m.inPlay = true))

    this.whoseTurn = OPPONENT_ID
    this.effectStack = new EffectStack(this)

    this.startGame()

    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)

    engine.addGameElementListener('gameState', 'getGameState', (data, done) => {
      notifyClient('getGameState', true, this.toJSON())
      done()
    })

    engine.addGameElementListener(
      'gameState', // TRY CHANGING THIS TO "this"
      'playMinion', // AND GET RID OF THIS. JUST HAVE engine DIRECTLY EXECUTE LISTENERS WITH this.listener(data, done)
      (data, done) => {
        this.playMinion(data.boardIndex, data.uniqueID)
        done()
      }
    )

    engine.addGameElementListener('gameState', 'tryAttack', (data, done) => {
      this.tryAttack(data.attackerID, data.targetID)
      done()
    })

    engine.addGameElementListener('gameState', 'checkHealth', (data, done) => {
      this.checkHealth()
      done()
    })

    engine.addGameElementListener('gameState', 'endTurn', (data, done) => {
      this.onEndTurn()
      done()
    })

    engine.addGameElementListener('gameState', 'cancel', (data, done) => {
      this.cancel()
      done()
    })

    engine.addGameElementListener('gameState', 'targetEffect', (data, done) => {
      this.targetEffect(data.targetID)
      done()
    })

    engine.queueEvent([{ event: 'endTurn', data: {} }])
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
      generateMinion(minion, this.getUniqueID(), PLAYER_ID)
    )

    this.opponentDeck = opponentDeckStorage.map((minion) =>
      generateMinion(minion, this.getUniqueID(), OPPONENT_ID)
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
    if (player === PLAYER_ID) {
      const card = this.playerDeck.pop()
      if (card) {
        console.log('player draws a card')
        this.playerHand.push(card)
        notifyClient('drawCard', true, this.toJSON())
      } else {
        console.log('player overdraws')
      }
    } else if (player === OPPONENT_ID) {
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
    this.effectStack.clear()
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

    const needTarget = this.effectStack.push('playMinion', {
      minion: minion,
      boardIndex: boardIndex,
      hand: minion.player === PLAYER_ID ? this.playerHand : this.opponentHand,
      board:
        minion.player === PLAYER_ID ? this.playerBoard : this.opponentBoard,
    })

    if (needTarget) {
      notifyClient('getTarget', true, {})
    }
  }

  targetEffect(targetID: number): void {
    const target: Minion | null = this.getBoardMinion(targetID)

    if (!target) {
      notifyClient('target', false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    } else if (!this.effectStack.isWaiting) {
      notifyClient('target', false, this.toJSON())
      console.error('No card is waiting for a target')
      return
    }

    const effect: Effect | null =
      this.effectStack.getTop().data.minion.effects.battlecry
    if (!effect || !effect.canTarget) {
      notifyClient('target', false, this.toJSON())
      console.error('No effect is waiting for a target')
      return
    }
    effect.target = target
    effect.gameState = this
    this.effectStack.push('battlecry', effect)

    const current: any = this.effectStack.getTop().data
    if (current instanceof Effect) {
      this.effectStack.executeStack()
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

    notifyClient('attack', true, {
      attacker: attacker,
      target: target,
    })

    attacker.doAttack(target)

    this.checkHealth()
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

    this.playerBoard = this.playerBoard.filter((m) => {
      if (m.health < 1) {
        this.graveyard.push(m)
        return false
      }
      return true
    })
    this.opponentBoard = this.opponentBoard.filter((m) => {
      if (m.health < 1) {
        this.graveyard.push(m)
        return false
      }
      return true
    })

    engine.queueEvent([
      {
        event: 'killMinion',
        data: {},
      },
    ])
  }

  onEndTurn(): void {
    ;[...this.playerBoard, ...this.opponentBoard].forEach((m) => {
      m.canAttack = !m.canAttack
    })

    this.whoseTurn = this.whoseTurn === PLAYER_ID ? OPPONENT_ID : PLAYER_ID

    if (this.whoseTurn === OPPONENT_ID) {
      this.simulateOpponentTurn()
    }
  }

  simulateOpponentTurn(): void {
    setTimeout(() => {
      engine.queueEvent([
        {
          event: 'endTurn',
          data: {},
        },
      ])
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
