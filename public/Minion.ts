import gsap from 'gsap'
import * as PIXI from 'pixi.js'
import {
  CardLocation,
  HeroClass,
  Keyword,
  PlayerID,
  Rarity,
  Tribe,
} from './constants.ts'
import * as DragState from './dragState.ts'

// COMBINE THIS AND BoardMinion INTO A SINGLE MINION OBJECT
// AND JUST SWITCH WHAT MODE IT'S IN

interface MinionServerData {
  id: number
  fileName: string
  playerOwner: PlayerID
  attacksThisTurn: number
  canAttack: boolean
  name: string
  description: string
  class: HeroClass
  rarity: Rarity
  tribe: Tribe
  overload: number
  baseMana: number
  baseAttack: number
  baseHealth: number
  maxHealth: number
  mana: number
  attack: number
  health: number
  keywords: Keyword[]
  location: CardLocation
}

export class Minion extends PIXI.Container {
  public offsetX: number = 0
  public offsetY: number = 0

  private portrait: PIXI.Sprite
  private frame: PIXI.Sprite
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
  private mx: number
  private my: number
  private ocardx: number
  private ocardy: number
  private rx: number = 0
  private ry: number = 0
  private physicsReady: boolean = false

  public serverData: MinionServerData = {
    id: 0,
    fileName: '',
    playerOwner: PlayerID.Player1,
    attacksThisTurn: 0,
    canAttack: false,
    name: '',
    description: '',
    class: HeroClass.Neutral,
    rarity: Rarity.Free,
    tribe: Tribe.None,
    overload: 0,
    baseMana: 0,
    baseAttack: 0,
    baseHealth: 0,
    maxHealth: 0,
    mana: 0,
    attack: 0,
    health: 0,
    keywords: [],
    location: CardLocation.Hand,
  }

  constructor() {
    super()

    this.serverData.location = CardLocation.Hand

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

    this.updateMana(6)
    this.updateAttack(4)
    this.updateHealth(5)

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

  private setupMana(): void {
    this.manaIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/mana.png')
    )
    this.manaIcon.anchor.set(0.5, 0.5)
    this.manaIcon.scale.set(0.55)
    this.manaIcon.position.set(
      -this.frame.width / 2 + 28,
      -this.frame.height / 2 + 56
    )
    this.manaText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.manaText.anchor.set(0.5, 0.5)
    this.manaText.position.set(
      -this.frame.width / 2 + 28,
      -this.frame.height / 2 + 48
    )
    this.addChild(this.manaIcon)
    this.addChild(this.manaText)
  }

  private setupAttack(): void {
    this.attackIcon = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/attack.png')
    )
    this.attackIcon.anchor.set(0.5, 0.5)
    this.attackIcon.scale.set(0.45)
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
    this.healthIcon.scale.set(0.4)
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

  private setupNameBanner(): void {
    this.nameBannerImage = new PIXI.Sprite(
      PIXI.Texture.from('./media/images/name-banner-minion.png')
    )
    this.nameBannerImage.anchor.set(0.5, 0.5)
    this.nameBannerImage.scale.set(0.5)
    this.nameBannerImage.position.set(0, 26)
    this.nameBannerText = new PIXI.Text({
      text: 'Cairne Bloodhoof',
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
    this.mx = this.x
    this.my = this.y
    this.on('pointerdown', (event) => {
      if (this.serverData.location === CardLocation.Hand) {
        this.physicsReady = true
        this.offsetX = this.x - event.global.x
        this.offsetY = this.y - event.global.y
        DragState.setDraggedObj(this)

        this.mx = event.global.x
        this.my = event.global.y
        this.ocardx = this.x
        this.ocardy = this.y
      }
    })
    this.on('pointermove', (event) => {
      if (this.serverData.location === CardLocation.Hand) {
        if (DragState.getDraggedObj() === this) {
          this.mx = event.global.x
          this.my = event.global.y
        } else {
          this.mx = this.x
          this.my = this.y
        }
      }
    })
    this.on('mouseover', (event) => {
      if (this.serverData.location === CardLocation.Hand) {
        gsap.to(this.scale, {
          x: 0.6,
          y: 0.6,
          duration: 0.2,
          ease: 'power1.out',
        })
      }
    })
    this.on('mouseout', (event) => {
      if (this.serverData.location === CardLocation.Hand) {
        gsap.to(this.scale, {
          x: 0.5,
          y: 0.5,
          duration: 0.2,
          ease: 'power1.out',
        })
      }
    })
  }

  private physicsLoop(delta: any): void {
    if (this.serverData.location !== CardLocation.Hand) return
    if (!this.physicsReady) return // prevents glitchy behavior on the first loop

    this.rx +=
      Math.max(Math.min((this.ocardy - this.y - this.rx) * 3, 15), -15) * 0.01
    this.ry +=
      Math.max(Math.min((this.x - this.ocardx - this.ry) * 3, 15), -15) * 0.01

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
