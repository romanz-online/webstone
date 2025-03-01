import { Mana } from './jsObjects/gameObjects/mana.js'

import { TargetController } from './jsObjects/gameControllers/targetController.js'
import { TurnController } from './jsObjects/gameControllers/turnController.js'
import { CardDrawController } from './jsObjects/gameControllers/cardDrawController.js'
import { CardPlayController } from './jsObjects/gameControllers/cardPlayController.js'

import { BoardView } from './jsObjects/views/BoardView.js'
import { DeckView } from './jsObjects/views/DeckView.js'
import { DialogueView } from './jsObjects/views/DialogueView.js'
import { HeroView } from './jsObjects/views/HeroView.js'

import { HandPlayerView } from './jsObjects/views/HandPlayerView.js'
import { HandOpponentView } from './jsObjects/views/HandOpponentView.js'
import { ManaPlayerView } from './jsObjects/views/ManaPlayerView.js'
import { ManaOpponentView } from './jsObjects/views/ManaOpponentView.js'

import { wsEventHandler } from './wsEventHandler.js'
let ws
const PLAYER_ID = 1,
  OPPONENT_ID = 2

class GAME {
  constructor() {
    this.playerDeckView = null
    this.opponentDeckView = null

    this.playerBoardView = null
    this.opponentBoardView = null

    this.playerHandView = null
    this.opponentHandView = null

    this.playerDialogueView = null
    this.opponentDialogueView = null

    this.playerHeroView = null
    this.opponentHeroView = null

    this.playerMana = null
    this.opponentMana = null

    this.playerManaView = null
    this.opponentManaView = null

    this.targetController = new TargetController()
    this.turnController = new TurnController()
    this.cardDrawController = new CardDrawController()
    this.cardPlayController = new CardPlayController()

    // TODO: move elsewhere
    ws = new WebSocket('ws://localhost:5500')
    ws.onopen = () => {
      console.log('Connected to WebSocket server')
    }
    ws.onclose = () => {
      console.log('Disconnected from WebSocket server')
    }

    wsEventHandler({
      socket: ws,
      event: 'getGameState',
      onSuccess: (data) => {
        this.playerHandView.hand = data.playerHand
        this.playerHandView.update()

        this.playerBoardView.board = data.playerBoard
        this.playerBoardView.update()

        this.opponentBoardView.board = data.opponentBoard
        this.opponentBoardView.update()

        this.playerHeroView.setHealth(data.playerHealth)
        this.opponentHeroView.setHealth(data.opponentHealth)
      },
      onFailure: (data) => {
        setTimeout(() => {
          this.triggerEvent('getGameState') // retry
        }, 5 * 1000)
      },
    })

    wsEventHandler({
      socket: ws,
      event: 'getTarget',
      onSuccess: (data) => {
        console.log('Starting to target')
        const rect = this.playerHeroView.getElement().getBoundingClientRect()
        this.targetController.startTargetting({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      },
    })

    wsEventHandler({
      socket: ws,
      event: 'minionDied',
      onSuccess: (data) => {
        console.log(`${data.minion.minionID} died`)
        this.triggerEvent('getGameState')
      },
    })

    wsEventHandler({
      socket: ws,
      event: 'minionPlayed',
      onSuccess: (data) => {
        console.log(`${data.minion.minionID} played`)
        // this.playerBoardView.playMinion(data.minion, data.boardIndex)
        // this.playerHandView.removeCard(data.minion)
        this.triggerEvent('getGameState')
      },
    })

    wsEventHandler({
      socket: ws,
      event: 'changeStats',
      onSuccess: (data) => {
        console.log(
          `${data.minion.minionID} stats changed to ${data.minion.mana}-${data.minion.attack}-${data.minion.health}`
        )
        // TODO: find a better way to do this. maybe have some minion pool shared between the two objects?
        // this.playerBoardView.changeStats(data.minionID, data.stats)
        // this.playerHandView.changeStats(data.minionID, data.stats)
        this.triggerEvent('getGameState')
      },
    })

    wsEventHandler({
      socket: ws,
      event: 'attack',
      onSuccess: (data) => {
        console.log(
          `${data.attacker.minionID} attacked ${data.target.minionID}`
        )
        this.triggerEvent('getGameState')
      },
    })

    wsEventHandler({
      socket: ws,
      event: 'endTurn',
      onSuccess: (data) => {
        console.log(`${data.whoseTurn}'s turn now`)
        if (data.whoseTurn == PLAYER_ID) {
          this.turnController.startPlayerTurn()
        } else {
          this.turnController.startOpponentTurn()
        }
        this.triggerEvent('getGameState')
      },
    })
  }

  resetValues() {
    this.playerDeckView = new DeckView(PLAYER_ID)
    this.opponentDeckView = new DeckView(OPPONENT_ID)

    this.playerBoardView = new BoardView(PLAYER_ID)
    this.opponentBoardView = new BoardView(OPPONENT_ID)

    this.playerHandView = new HandPlayerView()
    this.opponentHandView = new HandOpponentView()

    this.playerDialogueView = new DialogueView(PLAYER_ID)
    this.opponentDialogueView = new DialogueView(OPPONENT_ID)

    this.playerHeroView = new HeroView(PLAYER_ID)
    this.opponentHeroView = new HeroView(OPPONENT_ID)

    this.playerMana = new Mana()
    this.opponentMana = new Mana()

    // TODO: get rid of separate player/opponent views for Mana
    this.playerManaView = new ManaPlayerView(this.playerMana)
    this.opponentManaView = new ManaOpponentView(this.opponentMana)

    this.triggerEvent('getGameState')
  }

  triggerEvent(event, data = {}) {
    ws.send(JSON.stringify({ event: event, data: data }))
  }
}

export default new GAME()
