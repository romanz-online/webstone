import * as PIXI from 'pixi.js'
import { HandCard } from './Card.ts'
import { HeroPortrait } from './HeroPortrait.ts'
import * as DragState from './dragState.ts'
;(async () => {
  const app = new PIXI.Application()
  await app.init({
    resizeTo: window,
  })
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
    './media/images/cardimages/cairne_bloodhoof.jpg',
    './media/images/Card_Inhand_Minion_Priest.png',
    './media/images/card_inhand_minion_priest_frame.png',
  ])

  const background = PIXI.Sprite.from(
    await PIXI.Assets.load('media/images/background.png')
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

  // const cardData = {
  //   image: 'card-image.png',
  //   title: 'Fireball',
  //   description: 'Deal 6 damage.',
  // }

  app.stage.eventMode = 'static'
  app.stage.on('pointermove', (event) => {
    DragState.getDraggedObj()?.position.set(
      event.global.x + DragState.getDraggedObj().offsetX,
      event.global.y + DragState.getDraggedObj().offsetY
    )
  })
  app.stage.on('pointerup', DragState.clearDraggedObj)
  app.stage.on('pointerupoutside', DragState.clearDraggedObj)

  const jaina = new HeroPortrait()
  jaina.x = app.screen.width / 2
  jaina.y = app.screen.height / 2 + app.screen.height / 4
  app.stage.addChild(jaina)

  const jaina1 = new HeroPortrait()
  jaina1.x = app.screen.width / 2
  jaina1.y = app.screen.height / 2 - app.screen.height / 3
  app.stage.addChild(jaina1)

  const card = new HandCard()
  // card.scale.set(0.6)
  card.x = app.screen.width / 2
  card.y = app.screen.height / 2
  app.stage.addChild(card)
})()
