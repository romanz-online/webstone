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

const PLAYER_ID = 1,
  OPPONENT_ID = 2

class GameState {
  constructor() {
    this.playerDeck = []
    this.opponentDeck = []

    this.playerHand = []
    this.opponentHand = []

    this.playerBoard = []
    this.opponentBoard = [
      generateMinion(MINION_IDS.ALAKIR_THE_WINDLORD, 2, 0),
      generateMinion(MINION_IDS.CENARIUS, 2, 1),
      generateMinion(MINION_IDS.KORKRON_ELITE, 2, 2),
      generateMinion(MINION_IDS.SUMMONING_PORTAL, 2, 3),
      generateMinion(MINION_IDS.MANA_TIDE_TOTEM, 2, 4),
      generateMinion(MINION_IDS.ARATHI_WEAPONSMITH, 2, 5),
    ]

    for (const minion of this.opponentBoard) {
      minion.playedIndex = 1
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
        done()
      }
    )

    engine.addGameElementListener('gameState', 'tryAttack', (data, done) => {
      this.tryAttack(data.attackerID, data.targetID)
      done()
    })

    engine.addGameElementListener('gameState', 'minionDied', (data, done) => {
      this.onMinionDied(data.attackerID, data.targetID)
      done()
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

  startGame() {
    for (let i = 0; i < playerDeckStorage.length; i++) {
      this.playerDeck.push(generateMinion(playerDeckStorage[i], 1, i))
    }

    for (let i = 0; i < opponentDeckStorage.length; i++) {
      this.opponentDeck.push(generateMinion(opponentDeckStorage[i], 2, i))
    }

    this.shuffleDeck(this.playerDeck)
    this.shuffleDeck(this.opponentDeck)
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
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
      minion.playedIndex = 1
      this.playerBoard.splice(boardIndex, 0, minion)

      engine.queueEvent('minionPlayed', {
        boardIndex: boardIndex,
        minionID: minionID,
      })
    }
  }

  tryAttack(attackerID, targetID) {
    /** @type {Minion} */
    const attacker = this.getMinion(attackerID)
    if (!attacker) {
      console.error('Could not find attacker with ID', attackerID, 'on board')
      return
    }

    /** @type {Minion} */
    let target
    // enemy hero
    if (targetID !== 102) {
      target = this.getMinion(targetID)
      if (!target) {
        console.error('Could not find target with ID', targetID, 'on board')
        return
      }
    }

    // DO ERROR CHECKS HERE

    engine.queueEvent('attack', {
      attackerID: attackerID,
      targetID: targetID,
    })
  }

  onMinionDied(minionID) {
    /** @type {Minion} */
    const minion = this.getMinion(minionID)
    if (!minion) {
      console.error('Minion not on board', minionID)
      return
    }

    const playerIndex = this.playerBoard.indexOf(minion)
    if (playerIndex != -1) {
      this.playerBoard.splice(playerIndex, 1)
    } else {
      const opponentIndex = this.opponentBoard.indexOf(minion)
      if (opponentIndex != -1) {
        this.opponentBoard.splice(opponentIndex, 1)
      }
    }
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

  // playSpell(spell) {
  //     spell.cast(this);
  //     this.emit('spellPlayed', spell);
  // }

  // summonMinion(minion) {
  //     this.minions.push(minion);
  //     this.emit('minionSummoned', minion);
  // }

  /** @returns {Minion} */
  getMinion(minionID) {
    return [...this.playerBoard, ...this.opponentBoard].find(
      (minion) => minion.minionID == minionID
    )
  }
}

const gameState = new GameState()
module.exports = { gameState }
