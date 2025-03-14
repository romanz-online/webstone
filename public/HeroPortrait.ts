import * as PIXI from 'pixi.js'

export class HeroPortrait extends PIXI.Container {
  portrait: PIXI.Sprite
  healthIcon: PIXI.Sprite
  healthText: PIXI.Text

  constructor() {
    super()

    this.portrait = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/jaina_portrait.png')
    )
    this.portrait.anchor.set(0.5, 0.5)
    this.portrait.scale.set(0.36)
    this.addChild(this.portrait)

    this.healthIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/health.png')
    )
    this.healthIcon.anchor.set(0.5, 0.5)
    this.healthIcon.scale.set(0.2)
    this.healthIcon.position.set(
      this.portrait.width / 2 - 8,
      this.portrait.height / 2 - 14
    )
    this.addChild(this.healthIcon)

    this.healthText = new PIXI.Text({
      text: '30',
      style: {
        fontSize: 28,
        fill: 'white',
        fontWeight: 'bold',
        align: 'center',
      },
    })
    this.healthText.anchor.set(0.5, 0.5)
    this.healthText.position.set(
      this.portrait.width / 2 - 8,
      this.portrait.height / 2 - 16
    )
    this.addChild(this.healthText)
  }

  updateHealth(newHealth: number) {
    this.healthText.bannerText = newHealth
  }
}
