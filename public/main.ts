import FontFaceObserver from 'fontfaceobserver'
import * as PIXI from 'pixi.js'
import * as DragState from './dragState.ts'
import { Hand } from './Hand.ts'
import { Hero } from './Hero.ts'

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
    './media/images/jaina.png',
    './media/images/jaina_portrait.png',
    './media/images/mana.png',
    './media/images/attack.png',
    './media/images/health.png',
    './media/images/name-banner-minion.png',
    './media/images/cardimages/cairne_bloodhoof.jpg',
    './media/images/Card_Inhand_Minion_Priest.png',
    './media/images/card_inhand_minion_priest_frame.png',
    './media/images/empty_board_frame.png',
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
    DragState.getDraggedObj()?.position.set(
      event.global.x + DragState.getDraggedObj().offsetX,
      event.global.y + DragState.getDraggedObj().offsetY
    )
  })
  app.stage.on('pointerup', DragState.clearDraggedObj)
  app.stage.on('pointerupoutside', DragState.clearDraggedObj)

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

  // const minion = new BoardMinion()
  // minion.scale.set(1)
  // minion.position.set(app.screen.width / 2, app.screen.height / 2)
  // app.stage.addChild(minion)

  const hand = new Hand()
  hand.position.set(app.screen.width / 2, app.screen.height)
  app.stage.addChild(hand)
})()
