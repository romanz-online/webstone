import gsap from 'gsap'
import * as PIXI from 'pixi.js'
import CardDragState from './CardDragState.ts'
import MinionModel from './MinionModel.ts'

class MinionCardView extends PIXI.Container {
  public minion: MinionModel

  public revertZ: number
  public revertX: number = 0
  public revertY: number = 0
  public reverting: boolean = false

  public offsetX: number = 0
  public offsetY: number = 0

  private portrait: PIXI.Sprite
  private handFrame: PIXI.Sprite
  private manaIcon: PIXI.Sprite
  private manaText: PIXI.Text
  private attackIcon: PIXI.Sprite
  private attackText: PIXI.Text
  private healthIcon: PIXI.Sprite
  private healthText: PIXI.Text
  private nameBannerImage: PIXI.Sprite
  private nameBannerText: PIXI.Text
  private statTextStyle: PIXI.TextStyle
  private nameTextStyle: PIXI.TextStyle

  private ticker: PIXI.Ticker
  private ocardx: number
  private ocardy: number
  private rx: number = 0
  private ry: number = 0
  private physicsReady: boolean = false
  private enlarged: boolean = false

  constructor(minion: MinionModel) {
    super()

    this.minion = minion

    this.scale.set(0.4)

    this.portrait = PIXI.Sprite.from(
      './media/images/cardimages/cairne_bloodhoof.jpg'
    )
    this.portrait.anchor.set(0.5)
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

    this.handFrame = PIXI.Sprite.from(
      './media/images/card_inhand_minion_priest_frame.png'
    )
    this.handFrame.anchor.set(0.5)
    this.handFrame.scale.set(0.5)
    this.addChild(this.handFrame)

    this.statTextStyle = new PIXI.TextStyle({
      fontFamily: 'Belwe',
      stroke: { color: 'black', width: 7 },
      fontSize: 80,
      fill: 'white',
      fontWeight: 'bold',
      align: 'center',
    })

    this.handFrame = PIXI.Sprite.from(
      './media/images/card_inhand_minion_priest_frame.png'
    )
    this.handFrame.anchor.set(0.5)
    this.handFrame.scale.set(0.5)
    this.addChild(this.handFrame)

    this.statTextStyle = new PIXI.TextStyle({
      fontFamily: 'Belwe',
      stroke: { color: 'black', width: 7 },
      fontSize: 80,
      fill: 'white',
      fontWeight: 'bold',
      align: 'center',
    })

    this.nameTextStyle = new PIXI.TextStyle({
      fontFamily: 'Belwe',
      stroke: { color: 'black', width: 3 },
      fontSize: 20,
      fill: 'white',
      fontWeight: 'bold',
      align: 'center',
    })

    this.setupMana()
    this.setupAttack()
    this.setupHealth()
    this.setupNameBanner()

    this.setupCardPhysics()
  }

  updateMana(newMana: number): void {
    this.manaText.text = newMana
  }

  updateAttack(newAttack: number): void {
    this.attackText.text = newAttack
  }

  updateHealth(newHealth: number): void {
    this.healthText.text = newHealth
  }

  revert(): void {
    this.reverting = true
    this.zIndex = this.revertZ
    gsap.to(this.position, {
      x: this.revertX,
      y: this.revertY,
      duration: 0.4,
      ease: 'power4.out',
    })
    gsap.to(this.scale, {
      x: 0.4,
      y: 0.4,
      duration: 0.4,
      ease: 'power4.out',
      onComplete: () => {
        this.reverting = false
        this.enlarged = false
      },
    })
  }

  private setupMana(): void {
    this.manaIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/mana.png')
    )
    this.manaIcon.anchor.set(0.5, 0.5)
    this.manaIcon.scale.set(0.55)
    this.manaIcon.position.set(
      -this.handFrame.width / 2 + 28,
      -this.handFrame.height / 2 + 56
    )
    this.manaText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.manaText.anchor.set(0.5, 0.5)
    this.manaText.position.set(
      -this.handFrame.width / 2 + 28,
      -this.handFrame.height / 2 + 48
    )
    this.addChild(this.manaIcon)
    this.addChild(this.manaText)

    this.updateMana(this.minion.mana)
  }

  private setupAttack(): void {
    this.attackIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/attack.png')
    )
    this.attackIcon.anchor.set(0.5, 0.5)
    this.attackIcon.scale.set(0.45)
    this.attackIcon.position.set(
      -this.handFrame.width / 2 + 32,
      this.handFrame.height / 2 - 38
    )
    this.attackText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.attackText.anchor.set(0.5, 0.5)
    this.attackText.position.set(
      -this.handFrame.width / 2 + 35,
      this.handFrame.height / 2 - 42
    )
    this.addChild(this.attackIcon)
    this.addChild(this.attackText)

    this.updateAttack(this.minion.attack)
  }

  private setupHealth(): void {
    this.healthIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/health.png')
    )
    this.healthIcon.anchor.set(0.5, 0.5)
    this.healthIcon.scale.set(0.4)
    this.healthIcon.position.set(
      this.handFrame.width / 2 - 24,
      this.handFrame.height / 2 - 32
    )
    this.healthText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.healthText.anchor.set(0.5, 0.5)
    this.healthText.position.set(
      this.handFrame.width / 2 - 24,
      this.handFrame.height / 2 - 40
    )
    this.addChild(this.healthIcon)
    this.addChild(this.healthText)

    this.updateHealth(this.minion.health)
  }

  private setupNameBanner(): void {
    this.nameBannerImage = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/name-banner-minion.png')
    )
    this.nameBannerImage.anchor.set(0.5, 0.5)
    this.nameBannerImage.scale.set(0.5)
    this.nameBannerImage.position.set(0, 26)
    this.nameBannerText = new PIXI.Text({
      text: this.minion.name,
      style: this.nameTextStyle,
    })
    this.nameBannerText.anchor.set(0.5, 0.5)
    this.nameBannerText.position.set(0, 26)
    this.addChild(this.nameBannerImage)
    this.addChild(this.nameBannerText)
  }

  private setupCardPhysics(): void {
    this.eventMode = 'static'
    this.ticker = new PIXI.Ticker()
    this.ticker.add(this.physicsLoop.bind(this))
    this.ticker.start()
    this.ocardx = this.x
    this.ocardy = this.y
    this.on('pointerdown', (event) => {
      if (this.reverting) return

      this.physicsReady = true
      this.offsetX = this.x - event.global.x
      this.offsetY = this.y - event.global.y
      CardDragState.setDraggedCard(this)

      this.ocardx = this.x
      this.ocardy = this.y
    })
    this.on('pointerenter', (event) => {
      if (this.enlarged) return
      if (this.reverting) return
      if (CardDragState.getDraggedCard() === this) return

      this.enlarged = true
      this.zIndex = 999
      this.ocardy = this.y
      gsap.to(this.position, {
        x: this.x,
        y: this.y - 100,
        duration: 0.4,
        ease: 'power4.out',
      })
      gsap.to(this.scale, {
        x: 0.45,
        y: 0.45,
        duration: 0.4,
        ease: 'power4.out',
      })
    })
    this.on('pointerleave', (event) => {
      if (this.reverting) return
      if (CardDragState.getDraggedCard() === this) return

      this.revert()
    })
  }

  private physicsLoop(delta: any): void {
    if (!this.physicsReady) return // prevents glitchy behavior on the first loop

    this.rx +=
      Math.max(Math.min((this.ocardy - this.y - this.rx) * 3, 10), -10) * 0.01
    this.ry +=
      Math.max(Math.min((this.x - this.ocardx - this.ry) * 3, 10), -10) * 0.01

    this.rotation = ((this.rx + this.ry) * Math.PI) / 180

    let dx = this.x - this.ocardx,
      dy = this.y - this.ocardy
    if (dx > 0) {
      if (dy > 0) {
        // bottom right: + +
      } else {
        // top right: + -
        dx *= -1
      }
    } else {
      if (dy > 0) {
        // bottom left: - +
        dy *= -1
      } else {
        // top left: - -
        dx *= -1
        dy *= -1
      }
    }

    // top right/bottom left = - -
    // top left/bottom right = + +
    this.skew.x = dx * 0.001
    this.skew.y = dy * 0.001

    this.ocardx = this.x
    this.ocardy = this.y
  }
}

export default MinionCardView
