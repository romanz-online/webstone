import FontFaceObserver from 'fontfaceobserver'
import * as PIXI from 'pixi.js'
import Board from './Board.ts'
import CardDragState from './CardDragState.ts'
import { CardType, EventType } from './constants.ts'
import Hand from './Hand.ts'
import Hero from './Hero.ts'
import MinionBoardView from './MinionBoardView.ts'
import MinionCardView from './MinionCardView.ts'
import MinionModel from './MinionModel.ts'
import wsEventHandler from './wsEventHandler.ts'

const triggerWsEvent = (event: EventType, data: any = {}): void => {
  if (ws) {
    ws.send(JSON.stringify({ event: event, data: data }))
  } else {
    console.error('! WebSocket not defined')
  }
}

let ws: WebSocket
const minionModels: MinionModel[] = []
const minionCardViews: MinionCardView[] = []
const minionBoardViews: MinionBoardView[] = []

export const app = new PIXI.Application()
;(async () => {
  await app.init({
    resizeTo: window,
  })
  await new FontFaceObserver('Belwe').load()

  app.canvas.style.position = 'absolute'
  app.canvas.style.display = 'block'
  app.canvas.style.width = '100vw'
  app.canvas.style.height = '100vh'
  app.canvas.addEventListener('contextmenu', (event) => event.preventDefault())
  document.getElementById('pixi-container')!.appendChild(app.canvas)

  await PIXI.Assets.load([
    './media/images/jaina_portrait.png',
    './media/images/mana.png',
    './media/images/attack.png',
    './media/images/health.png',
    './media/images/name-banner-minion.png',
    './media/images/cardimages/cairne_bloodhoof.jpg',
    './media/images/card_inhand_minion_priest_frame.png',
    './media/images/minion_board_frame.png',
  ])

  const background = PIXI.Sprite.from(
    await PIXI.Assets.load('media/images/combat_board_tmp.png')
  )
  background.anchor.set(0.5, 0.5)
  background.x = app.screen.width / 2
  background.y = app.screen.height / 2
  const scale = Math.min(
    app.screen.width / background.width,
    app.screen.height / background.height
  )

  background.scale.set(scale)
  app.stage.addChildAt(background, 0)

  app.stage.eventMode = 'static'
  app.stage.on('pointermove', (event) => {
    CardDragState.getDraggedCard()?.position.set(
      event.global.x + CardDragState.getDraggedCard().offsetX,
      event.global.y + CardDragState.getDraggedCard().offsetY
    )
  })

  const jaina = new Hero()
  jaina.position.set(
    app.screen.width / 2 - jaina.width / 2,
    app.screen.height / 2 + app.screen.height / 4 - jaina.height / 2
  )
  app.stage.addChild(jaina)

  const jaina1 = new Hero()
  jaina1.position.set(
    app.screen.width / 2 - jaina1.width / 2,
    app.screen.height / 2 - app.screen.height / 3 - jaina1.height / 2
  )
  app.stage.addChild(jaina1)

  const board = new Board(app.screen.width / 2, app.screen.height / 4)
  board.position.set(app.screen.width / 4, app.screen.height / 2)
  app.stage.addChild(board)

  // const board1 = new Board(app.screen.width / 2, app.screen.height / 4)
  // board1.position.set(app.screen.width / 4, app.screen.height / 4)
  // app.stage.addChild(board1)

  const hand = new Hand(app.screen.width / 4, app.screen.height / 6)
  hand.position.set(
    app.screen.width / 2 - hand.width / 2,
    app.screen.height - hand.height
  )
  app.stage.addChild(hand)

  // const hand1 = new Hand(app.screen.width / 3, app.screen.width / 12)
  // hand1.position.set(app.screen.width / 2 - hand1.width / 2, -hand1.height / 2)
  // app.stage.addChild(hand1)

  app.stage.on('pointermove', (event) => {
    if (!CardDragState.getDraggedCard()) return

    const card: MinionCardView = CardDragState.getDraggedCard()

    const cardBounds: PIXI.Bounds = card.getBounds(),
      dropBounds: PIXI.Bounds = board.getBounds()

    if (
      cardBounds.x + cardBounds.width > dropBounds.x &&
      cardBounds.x < dropBounds.x + dropBounds.width &&
      cardBounds.y + cardBounds.height > dropBounds.y &&
      cardBounds.y < dropBounds.y + dropBounds.height
    ) {
      board.handleCardDragOver(cardBounds.x, cardBounds.y)
    }
  })

  app.stage.on('pointerup', (event) => {
    if (!CardDragState.getDraggedCard()) return

    const card: MinionCardView = CardDragState.getDraggedCard()

    const cardBounds = card.getBounds(),
      dropBounds = board.getBounds()

    if (
      cardBounds.x + cardBounds.width > dropBounds.x &&
      cardBounds.x < dropBounds.x + dropBounds.width &&
      cardBounds.y + cardBounds.height > dropBounds.y &&
      cardBounds.y < dropBounds.y + dropBounds.height
    ) {
      console.log('Dropped on board')
      triggerWsEvent(EventType.TryPlayCard, {
        playerID: card.minion.playerOwner,
        cardType: CardType.Minion,
        minionID: card.minion.id,
        boardIndex: board.placeholderIndex,
      })
    } else {
      console.log('Dropped outside')
      card.revert()
    }
    board.resetPlaceholder()

    CardDragState.clearDraggedCard()
  })

  app.stage.on('pointerupoutside', CardDragState.clearDraggedCard)

  console.log('Connecting WebSocket...')
  ws = new WebSocket('ws://localhost:5500')
  ws.onopen = () => {
    console.log('Connected to WebSocket server')

    console.log('Setting up WebSocket listeners...')
    wsEventHandler({
      socket: ws,
      event: EventType.Load,
      onSuccess: (data: any) => {
        data.player1.hand.forEach((card) => {
          const model = new MinionModel(card),
            cardView = new MinionCardView(model)
          minionModels.push(model)
          minionCardViews.push(cardView)
          minionBoardViews.push(new MinionBoardView(model))
        })
        hand.setHandData(minionCardViews)
        board.setBoardData(minionBoardViews)
      },
      onFailure: (data: any) => {
        setTimeout(() => {
          triggerWsEvent(EventType.TryLoad) // retry
        }, 5 * 1000)
      },
    })

    wsEventHandler({
      socket: ws,
      event: EventType.PlayCard,
      onSuccess: (data: any) => {
        hand.playCard(data.cardID)
      },
    })

    wsEventHandler({
      socket: ws,
      event: EventType.SummonMinion,
      onSuccess: (data: any) => {
        // board.summonMinion(data.minionID, data.boardIndex)
      },
    })

    console.log('Loading game state...')
    triggerWsEvent(EventType.TryLoad)
  }
  ws.onclose = () => {
    console.log('Disconnected from WebSocket server')
  }
})()
