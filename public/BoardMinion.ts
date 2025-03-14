import * as PIXI from 'pixi.js'

export class BoardMinion extends PIXI.Container {
  private portrait: PIXI.Sprite
  private frame: PIXI.Sprite
  private attackIcon: PIXI.Sprite
  private attackText: PIXI.Text
  private healthIcon: PIXI.Sprite
  private healthText: PIXI.Text
  private statTextStyle: PIXI.TextStyle

  constructor() {
    super()

    this.portrait = PIXI.Sprite.from(
      './media/images/cardimages/cairne_bloodhoof.jpg'
    )
    this.portrait.anchor.set(0.5, 0.5)
    this.portrait.scale.set(0.07)
    this.portrait.position.set(-30, 0)
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

    this.frame = PIXI.Sprite.from('./media/images/empty_board_frame.png')
    this.frame.anchor.set(0.5, 0.5)
    this.frame.scale.set(0.5)
    this.addChild(this.frame)

    this.statTextStyle = new PIXI.TextStyle({
      fontFamily: 'Belwe',
      stroke: 'black',
      strokeThickness: 7,
      fontSize: 60,
      fill: 'white',
      fontWeight: 'bold',
      align: 'center',
    })

    this.setupAttack()
    this.setupHealth()

    this.updateAttack(4)
    this.updateHealth(5)

    this.eventMode = 'static'
  }

  updateAttack(newAttack: number): void {
    this.attackText.text = newAttack
  }

  updateHealth(newHealth: number): void {
    this.healthText.text = newHealth
  }

  private setupAttack(): void {
    this.attackIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/attack.png')
    )
    this.attackIcon.anchor.set(0.5, 0.5)
    this.attackIcon.scale.set(0.3)
    this.attackIcon.position.set(
      -this.frame.width / 2 + 32,
      this.frame.height / 2 - 38
    )
    this.attackText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.attackText.anchor.set(0.5, 0.5)
    this.attackText.position.set(
      -this.frame.width / 2 + 35,
      this.frame.height / 2 - 42
    )
    this.addChild(this.attackIcon)
    this.addChild(this.attackText)
  }

  private setupHealth(): void {
    this.healthIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/health.png')
    )
    this.healthIcon.anchor.set(0.5, 0.5)
    this.healthIcon.scale.set(0.3)
    this.healthIcon.position.set(
      this.frame.width / 2 - 24,
      this.frame.height / 2 - 32
    )
    this.healthText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.healthText.anchor.set(0.5, 0.5)
    this.healthText.position.set(
      this.frame.width / 2 - 24,
      this.frame.height / 2 - 40
    )
    this.addChild(this.healthIcon)
    this.addChild(this.healthText)
  }
}
