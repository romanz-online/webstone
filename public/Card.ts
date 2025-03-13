import * as PIXI from 'pixi.js'

export class HandCard extends PIXI.Container {
  portrait: PIXI.Sprite
  frame: PIXI.Sprite
  manaIcon: PIXI.Sprite
  manaText: PIXI.Text
  attackIcon: PIXI.Sprite
  attackText: PIXI.Text
  healthIcon: PIXI.Sprite
  healthText: PIXI.Text

  constructor() {
    super()

    this.portrait = PIXI.Sprite.from(
      './media/images/cardimages/cairne_bloodhoof.jpg'
    )
    this.portrait.anchor.set(0.5, 0.5)
    this.portrait.scale.set(0.1)
    this.portrait.position.set(-50, -90)
    this.addChild(this.portrait)

    const mask = new PIXI.Graphics()
      .ellipse(
        this.portrait.width / 2 + 350,
        this.portrait.height / 2,
        1100,
        1600
      )
      .fill(0x000000)
    this.portrait.mask = mask
    this.portrait.addChild(mask)

    this.frame = PIXI.Sprite.from(
      './media/images/card_inhand_minion_priest_frame.png'
    )
    this.frame.anchor.set(0.5, 0.5)
    this.frame.scale.set(0.5)
    this.addChild(this.frame)

    // HEALTH
    this.healthIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/health.png')
    )
    this.healthIcon.anchor.set(0.5, 0.5)
    this.healthIcon.scale.set(0.4)
    this.healthIcon.position.set(
      this.frame.width / 2 - 24,
      this.frame.height / 2 - 32
    )
    this.healthText = new PIXI.Text({
      text: '5',
      style: {
        fontSize: 56,
        fill: 'white',
        fontWeight: 'bold',
        align: 'center',
      },
    })
    this.healthText.anchor.set(0.5, 0.5)
    this.healthText.position.set(
      this.frame.width / 2 - 8,
      this.frame.height / 2 - 24
    )
    this.addChild(this.healthIcon)
    this.addChild(this.healthText)

    // ATTACK
    this.attackIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/attack.png')
    )
    this.attackIcon.anchor.set(0.5, 0.5)
    this.attackIcon.scale.set(0.45)
    this.attackIcon.position.set(
      -this.frame.width / 2 + 32,
      this.frame.height / 2 - 36
    )
    this.attackText = new PIXI.Text({
      text: '5',
      style: {
        fontSize: 56,
        fill: 'white',
        fontWeight: 'bold',
        align: 'center',
      },
    })
    this.attackText.anchor.set(0.5, 0.5)
    this.attackText.position.set(
      this.frame.width / 2 - 8,
      this.frame.height / 2 - 24
    )
    this.addChild(this.attackIcon)
    this.addChild(this.attackText)

    this.eventMode = 'static'
    let dragging: boolean = false,
      offsetX: number,
      offsetY: number
    this.on('pointerdown', (event) => {
      dragging = true
      const pos = event.global
      offsetX = this.x - pos.x
      offsetY = this.y - pos.y
    })

    // MOVE THIS TO main. app.stage.on(...)
    this.on('pointermove', (event) => {
      if (dragging) {
        const pos = event.global
        this.x = pos.x + offsetX
        this.y = pos.y + offsetY
      }
    })

    this.on('pointerup', () => {
      dragging = false
      this.alpha = 1
    })

    this.on('pointerupoutside', () => {
      dragging = false
      this.alpha = 1
    })
  }

  updateHealth(newHealth: number) {
    this.healthText.text = newHealth
  }
}
