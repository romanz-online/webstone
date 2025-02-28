const { engine } = require('./engine.js')
const { notifyClient } = require('./ws.js')
const { generateMinion } = require('./minionData/generateMinion.js')
const {
  ATTRIBUTES,
  MINION_IDS,
  MINION_DATA,
} = require('./minionData/baseMinionData.js')
const Minion = require('./minionData/minion.js')
/** @typedef {Object} Minion */

const playerDeckStorage = [
    MINION_IDS.ARMORSMITH,
    MINION_IDS.TIRION_FORDRING,
    MINION_IDS.MANA_WYRM,
    MINION_IDS.LIGHTWELL,
    MINION_IDS.GUARDIAN_OF_KINGS,
  ],
  opponentDeckStorage = []

const PLAYER_ID = -1,
  OPPONENT_ID = -2

class GameState {
  constructor() {
    this.uniqueMinionNumber = 0

    this.playerHealth = 30
    this.opponentHealth = 10

    this.graveyard = []
    this.playerDeck = []
    this.opponentDeck = []
    this.playerHand = []
    this.opponentHand = []
    this.playerBoard = []
    this.opponentBoard = [
      generateMinion(
        MINION_IDS.ALAKIR_THE_WINDLORD,
        this.getUniqueMinionID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_IDS.CENARIUS,
        this.getUniqueMinionID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_IDS.KORKRON_ELITE,
        this.getUniqueMinionID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_IDS.SUMMONING_PORTAL,
        this.getUniqueMinionID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_IDS.MANA_TIDE_TOTEM,
        this.getUniqueMinionID(),
        OPPONENT_ID
      ),
      generateMinion(
        MINION_IDS.ARATHI_WEAPONSMITH,
        this.getUniqueMinionID(),
        OPPONENT_ID
      ),
    ]

    this.opponentBoard.forEach((m) => (m.inPlay = true))

    this.whoseTurn = OPPONENT_ID

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
      'tryMinionPlayed', // AND GET RID OF THIS. JUST HAVE engine DIRECTLY EXECUTE LISTENERS WITH this.listener(data, done)
      (data, done) => {
        this.tryMinionPlayed(data.isPlayer, data.boardIndex, data.minionID)
        done()
      }
    )

    engine.addGameElementListener('gameState', 'tryAttack', (data, done) => {
      this.tryAttack(data.attackerID, data.targetID)
      done()
    })

    engine.addGameElementListener('gameState', 'attack', (data, done) => {
      this.onAttack(data.attackerID, data.targetID)
      done()
    })

    engine.addGameElementListener('gameState', 'applyDamage', (data, done) => {
      this.checkHealth()
      done()
    })

    engine.addGameElementListener('gameState', 'endTurn', (data, done) => {
      this.onEndTurn()
      done()
    })

    engine.queueEvent([{ event: 'endTurn', data: {} }])
  }

  toJSON() {
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

  getUniqueMinionID() {
    return this.uniqueMinionNumber++
  }

  startGame() {
    this.playerDeck = playerDeckStorage.map((minion) =>
      generateMinion(minion, this.getUniqueMinionID(), PLAYER_ID)
    )

    this.opponentDeck = opponentDeckStorage.map((minion) =>
      generateMinion(minion, this.getUniqueMinionID(), OPPONENT_ID)
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

  drawCard(player) {
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

  tryMinionPlayed(isPlayer, boardIndex, minionID) {
    if (isPlayer) {
      const index = this.playerHand.findIndex(
        (minion) => minion.minionID == minionID
      )
      if (index === -1) {
        notifyClient('tryMinionPlayed', false, this.toJSON())
        console.error(`Could not find minion ${minionID}`)
        return
      }

      // DO MORE ERROR CHECKS
      // notifyClient('tryMinionPlayed', false, this.toJSON())

      /** @type {Minion} */
      const minion = this.playerHand.splice(index, 1)[0]
      this.playerBoard.splice(boardIndex, 0, minion)
      minion.inPlay = true

      notifyClient('minionPlayed', true, {
        minion: minion,
      })

      // engine.queueEvent([
      //   {
      //     event: 'minionPlayed',
      //     data: {
      //       minion: minion,
      //     },
      //   },
      // ])
    }
  }

  tryAttack(attackerID, targetID) {
    /** @type {Minion} */
    const attacker = this.getBoardMinion(attackerID),
      target = this.getBoardMinion(targetID)
    if (!attacker) {
      notifyClient('tryAttack', false, this.toJSON())
      console.error('Could not find attacker with ID', attackerID, 'on board')
      return
    }
    if (!target) {
      notifyClient('tryAttack', false, this.toJSON())
      console.error('Could not find target with ID', targetID, 'on board')
      return
    }

    // DO ERROR CHECKS HERE
    // notifyClient('tryAttack', false, this.toJSON())

    engine.queueEvent([
      {
        event: 'attack',
        data: {
          attacker: attacker,
          target: target,
        },
      },
    ])
  }

  onAttack(attackerID, targetID) {
    // MOVE THIS TO MINION CLASS
    // HAVE MINIONS DO attack(), APPLY DAMAGE, AND THEN TRIGGER THE ATTACKED MINION'S receiveAttack()
    // WHICH THEN APPLIES DAMAGE BACK TO THE ATTACKER (IF APPLICABLE)

    /** @type {Minion} */
    const attacker = this.getBoardMinion(attackerID),
      target = this.getBoardMinion(targetID)

    engine.queueEvent([
      {
        event: 'applyDamage',
        data: {
          source: attacker, // SWITCH TO USING MINION OBJECTS INSTEAD OF JUST ID'S
          target: target,
          damage: attacker.attack,
        },
      },
      {
        event: 'applyDamage',
        data: {
          source: target,
          target: attacker,
          damage: target.attack,
        },
      },
    ])
  }

  checkHealth() {
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
    ]) // HOW DO I HANDLE CASES WHERE A MINION NEEDS TO KNOW WHEN *IT* KILLS ANOTHER MINION?
    // MAYBE STORE "lastDamagedBy" IN EACH MINION?
  }

  onEndTurn() {
    ;[...this.playerBoard, ...this.opponentBoard].forEach((m) => {
      m.canAttack = !m.canAttack
    })

    this.whoseTurn = this.whoseTurn === PLAYER_ID ? OPPONENT_ID : PLAYER_ID

    if (this.whoseTurn === OPPONENT_ID) {
      this.simulateOpponentTurn()
    }
  }

  simulateOpponentTurn() {
    setTimeout(() => {
      engine.queueEvent([
        {
          event: 'endTurn',
          data: {},
        },
      ])
    }, 2 * 1000)
  }

  /** @returns {Minion} */
  getBoardMinion(minionID) {
    return [...this.playerBoard, ...this.opponentBoard].find(
      (minion) => minion.minionID == minionID
    )
  }
}

module.exports = GameState
