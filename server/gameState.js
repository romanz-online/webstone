const { engine } = require('./engine.js')
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

    this.graveyard = []
    this.playerDeck = []
    this.opponentDeck = []
    this.playerHand = []
    this.opponentHand = []
    this.playerBoard = []

    this.opponentBoard = [
      generateMinion(MINION_IDS.ALAKIR_THE_WINDLORD, this.getUniqueMinionID()),
      generateMinion(MINION_IDS.CENARIUS, this.getUniqueMinionID()),
      generateMinion(MINION_IDS.KORKRON_ELITE, this.getUniqueMinionID()),
      generateMinion(MINION_IDS.SUMMONING_PORTAL, this.getUniqueMinionID()),
      generateMinion(MINION_IDS.MANA_TIDE_TOTEM, this.getUniqueMinionID()),
      generateMinion(MINION_IDS.ARATHI_WEAPONSMITH, this.getUniqueMinionID()),
    ]

    for (const minion of this.opponentBoard) {
      minion.inPlay = true
    }

    this.playerHealth = 30
    this.opponentHealth = 10

    this.whoseTurn = PLAYER_ID

    this.startGame()

    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)
    this.drawCard(PLAYER_ID)

    engine.addGameElementListener(
      'gameState',
      'tryMinionPlayed',
      (data, done) => {
        this.tryMinionPlayed(data.isPlayer, data.boardIndex, data.minionID)
        done(true)
      }
    )

    engine.addGameElementListener('gameState', 'tryAttack', (data, done) => {
      this.tryAttack(data.attackerID, data.targetID)
      done(true)
    })

    engine.addGameElementListener('gameState', 'attack', (data, done) => {
      this.onAttack(data.attackerID, data.targetID)
      done(true)
    })

    engine.addGameElementListener('gameState', 'applyDamage', (data, done) => {
      this.checkHealth()
      done(true)
    })
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
    return ++this.uniqueMinionNumber
  }

  startGame() {
    for (let i = 0; i < playerDeckStorage.length; i++) {
      this.playerDeck.push(
        generateMinion(playerDeckStorage[i], this.getUniqueMinionID())
      )
    }

    for (let i = 0; i < opponentDeckStorage.length; i++) {
      this.opponentDeck.push(
        generateMinion(opponentDeckStorage[i], this.getUniqueMinionID())
      )
    }

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
    if (player == PLAYER_ID) {
      const card = this.playerDeck.pop()
      if (card) {
        console.log('player draws a card')
        this.playerHand.push(card)
      } else {
        console.log('player overdraws')
      }
    } else if (player == OPPONENT_ID) {
      const card = this.opponentDeck.pop()
      if (card) {
        console.log('opponent draws a card')
        this.opponentHand.push(card)
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
        console.error(`Could not find minion ${minionID}`)
        return
      }

      // DO MORE ERROR CHECKS

      /** @type {Minion} */
      const minion = this.playerHand.splice(index, 1)[0]
      minion.inPlay = true
      this.playerBoard.splice(boardIndex, 0, minion)

      engine.queueEvent('minionPlayed', {
        boardIndex: boardIndex,
        minionID: minionID,
      })
    }
  }

  tryAttack(attackerID, targetID) {
    /** @type {Minion} */
    const attacker = this.getMinion(attackerID),
      target = this.getMinion(targetID)
    if (!attacker) {
      console.error('Could not find attacker with ID', attackerID, 'on board')
      return
    }
    if (!target) {
      console.error('Could not find target with ID', targetID, 'on board')
      return
    }

    // DO ERROR CHECKS HERE

    engine.queueEvent('attack', {
      attackerID: attackerID,
      targetID: targetID,
    })
  }

  onAttack(attackerID, targetID) {
    /** @type {Minion} */
    const attacker = this.getMinion(attackerID),
      target = this.getMinion(targetID)

    engine.queueEvent('applyDamage', {
      sourceID: attackerID, // SWITCH TO USING MINION OBJECTS INSTEAD OF JUST ID'S
      targetID: targetID,
      damage: attacker.attack,
    })

    if (target.attack > 0) {
      engine.queueEvent('applyDamage', {
        sourceID: targetID,
        targetID: attackerID,
        damage: target.attack,
      })
    }
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

    engine.queueEvent('killMinion', {}) // HOW DO I HANDLE CASES WHERE A MINION NEEDS TO KNOW WHEN *IT* KILLS ANOTHER MINION?
    // MAYBE STORE "lastDamagedBy" IN EACH MINION?
  }

  endTurn() {
    if (this.whoseTurn == PLAYER_ID) {
      this.whoseTurn = OPPONENT_ID
      this.simulateOpponentTurn()
    } else {
      this.whoseTurn = PLAYER_ID
    }

    // this.triggerEffect('onEndTurn', {})

    // sendEvent(this.ws, 'endTurn', true, {
    //   whoseTurn: this.whoseTurn,
    // })
  }

  simulateOpponentTurn() {
    setTimeout(() => {
      this.endTurn()
    }, 2 * 1000)
  }

  /** @returns {Minion} */
  getMinion(minionID) {
    return [...this.playerBoard, ...this.opponentBoard].find(
      (minion) => minion.minionID == minionID
    )
  }
}

const gameState = new GameState()
module.exports = { gameState }
