import gsap from 'gsap'
import * as PIXI from 'pixi.js'
import { BoardMinion } from './BoardMinion.ts'
import * as DragState from './dragState.ts'
import { HandCard } from './HandCard.ts'
import { HeroPortrait } from './HeroPortrait.ts'

export const app = new PIXI.Application()
;(async () => {
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

  const jaina = new HeroPortrait()
  jaina.x = app.screen.width / 2
  jaina.y = app.screen.height / 2 + app.screen.height / 4
  app.stage.addChild(jaina)

  const jaina1 = new HeroPortrait()
  jaina1.x = app.screen.width / 2
  jaina1.y = app.screen.height / 2 - app.screen.height / 3
  app.stage.addChild(jaina1)

  const minion = new BoardMinion()
  minion.scale.set(1)
  minion.x = app.screen.width / 2
  minion.y = app.screen.height / 2
  app.stage.addChild(minion)

  for (let i = 0; i < 5; i++) {
    const card = new HandCard()
    card.scale.set(0.5)
    card.x = app.screen.width / 3 + (i + 1) * (card.width / 2)
    card.y = app.screen.height - 24

    card.on('mouseover', (event) => {
      gsap.to(card.scale, { x: 0.6, y: 0.6, duration: 0.2, ease: 'power1.out' })
    })
    card.on('mouseout', (event) => {
      gsap.to(card.scale, { x: 0.5, y: 0.5, duration: 0.2, ease: 'power1.out' })
    })
    app.stage.addChild(card)
  }
})()
