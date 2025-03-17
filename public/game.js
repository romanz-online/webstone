// import { Mana } from './jsObjects/gameObjects/mana.js'

// import { TargetController } from './jsObjects/gameControllers/targetController.js'
// import { TurnController } from './jsObjects/gameControllers/turnController.js'
// import { CardDrawController } from './jsObjects/gameControllers/cardDrawController.js'
// import { CardPlayController } from './jsObjects/gameControllers/cardPlayController.js'

// import { BoardView } from './jsObjects/views/BoardView.js'
// import { DeckView } from './jsObjects/views/DeckView.js'
// import { DialogueView } from './jsObjects/views/DialogueView.js'
// import { HeroView } from './jsObjects/views/HeroView.js'

// import { HandPlayerView } from './jsObjects/views/HandPlayerView.js'
// import { HandOpponentView } from './jsObjects/views/HandOpponentView.js'
// import { ManaPlayerView } from './jsObjects/views/ManaPlayerView.js'
// import { ManaOpponentView } from './jsObjects/views/ManaOpponentView.js'

// import { wsEventHandler } from './wsEventHandler.js'

// import './jsObjects/constants.js'
// import { EventType, PlayerID } from './jsObjects/constants.js'

// let ws

// class GAME {
//   constructor() {
//     this.playerDeckView = null
//     this.opponentDeckView = null

//     this.playerBoardView = null
//     this.opponentBoardView = null

//     this.playerHandView = null
//     this.opponentHandView = null

//     this.playerDialogueView = null
//     this.opponentDialogueView = null

//     this.playerHeroView = null
//     this.opponentHeroView = null

//     this.playerMana = null
//     this.opponentMana = null

//     this.playerManaView = null
//     this.opponentManaView = null

//     this.targetController = new TargetController()
//     this.turnController = new TurnController()
//     this.cardDrawController = new CardDrawController()
//     this.cardPlayController = new CardPlayController()

//     // TODO: move elsewhere
//     ws = new WebSocket('ws://localhost:5500')
//     ws.onopen = () => {
//       console.log('Connected to WebSocket server')
//     }
//     ws.onclose = () => {
//       console.log('Disconnected from WebSocket server')
//     }

//     wsEventHandler({
//       socket: ws,
//       event: EventType.Load,
//       onSuccess: (data) => {
//         this.playerHandView.hand = data.playerHand
//         this.playerHandView.update()

//         this.playerBoardView.board = data.playerBoard
//         this.playerBoardView.update()

//         this.opponentBoardView.board = data.opponentBoard
//         this.opponentBoardView.update()

//         this.playerHeroView.setHealth(data.playerHealth)
//         this.opponentHeroView.setHealth(data.opponentHealth)
//       },
//       onFailure: (data) => {
//         setTimeout(() => {
//           this.triggerEvent(EventType.Load) // retry
//         }, 5 * 1000)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.Target,
//       onSuccess: (data) => {
//         console.log('Starting to target')
//         const rect = this.playerHeroView.getElement().getBoundingClientRect()
//         this.targetController.startTargetting({
//           x: rect.left + rect.width / 2,
//           y: rect.top + rect.height / 2,
//         })
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.Cancel,
//       onSuccess: (data) => {
//         this.targetController.resetAttack()
//         this.triggerEvent(EventType.Load)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.KillMinion,
//       onSuccess: (data) => {
//         console.log(`${data.minion.id} died`)
//         this.triggerEvent(EventType.Load)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.PlayMinion,
//       onSuccess: (data) => {
//         console.log(`${data.minion.id} played`)
//         // this.playerBoardView.playMinion(data.minion, data.boardIndex)
//         // this.playerHandView.removeCard(data.minion)
//         this.triggerEvent(EventType.Load)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.ChangeStats,
//       onSuccess: (data) => {
//         console.log(
//           `${data.minion.id} stats changed to ${data.minion.mana}-${data.minion.attack}-${data.minion.health}`
//         )
//         // TODO: find a better way to do this. maybe have some minion pool shared between the two objects?
//         // this.playerBoardView.changeStats(data.id, data.stats)
//         // this.playerHandView.changeStats(data.id, data.stats)
//         this.triggerEvent(EventType.Load)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.Damage,
//       onSuccess: (data) => {
//         console.log(`${data.minion.id} takes ${data.damage} damage`)
//         this.triggerEvent(EventType.Load)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.Attack,
//       onSuccess: (data) => {
//         console.log(`${data.attacker.id} attacked ${data.target.id}`)
//         this.triggerEvent(EventType.Load)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.EndTurn,
//       onSuccess: (data) => {
//         console.log(`${data.whoseTurn}'s turn now`)
//         if (data.whoseTurn == PlayerID.Player1) {
//           this.turnController.startPlayerTurn()
//         } else {
//           this.turnController.startOpponentTurn()
//         }
//         this.triggerEvent(EventType.Load)
//       },
//     })
//   }

//   resetValues() {
//     this.playerDeckView = new DeckView(PlayerID.Player1)
//     this.opponentDeckView = new DeckView(PlayerID.Player2)

//     this.playerBoardView = new BoardView(PlayerID.Player1)
//     this.opponentBoardView = new BoardView(PlayerID.Player2)

//     this.playerHandView = new HandPlayerView()
//     this.opponentHandView = new HandOpponentView()

//     this.playerDialogueView = new DialogueView(PlayerID.Player1)
//     this.opponentDialogueView = new DialogueView(PlayerID.Player2)

//     this.playerHeroView = new HeroView(PlayerID.Player1)
//     this.opponentHeroView = new HeroView(PlayerID.Player2)

//     this.playerMana = new Mana()
//     this.opponentMana = new Mana()

//     // TODO: get rid of separate player/opponent views for Mana
//     this.playerManaView = new ManaPlayerView(this.playerMana)
//     this.opponentManaView = new ManaOpponentView(this.opponentMana)

//     this.triggerEvent(EventType.Load)
//   }

//   triggerEvent(event, data = {}) {
//     ws.send(JSON.stringify({ event: event, data: data }))
//   }
// }

// export default new GAME()
