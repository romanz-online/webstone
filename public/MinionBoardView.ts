import * as PIXI from 'pixi.js'
import MinionModel from './MinionModel.ts'

class MinionBoardView extends PIXI.Container {
  public minion: MinionModel

  private portrait: PIXI.Sprite
  private frame: PIXI.Sprite
  private attackText: PIXI.Text
  private healthText: PIXI.Text
  private statTextStyle: PIXI.TextStyle

  constructor(minion: MinionModel) {
    super()

    this.minion = minion

    this.scale.set(0.8)

    this.portrait = PIXI.Sprite.from(
      './media/images/cardimages/cairne_bloodhoof.jpg'
    )
    // this.loadPortraitImage()
    this.portrait.anchor.set(0.5)
    this.portrait.scale.set(0.069)
    this.portrait.position.set(-30, -4)
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

    this.frame = PIXI.Sprite.from('./media/images/minion_board_frame.png')
    this.frame.anchor.set(0.5)
    this.frame.scale.set(0.5)
    this.addChild(this.frame)

    this.statTextStyle = new PIXI.TextStyle({
      fontFamily: 'Belwe',
      stroke: { color: 'black', width: 4 },
      fontSize: 46,
      fill: 'white',
      fontWeight: 'bold',
      align: 'center',
    })

    this.setupAttack()
    this.setupHealth()

    this.eventMode = 'static'
  }

  updateAttack(newAttack: number): void {
    this.attackText.text = newAttack
  }

  updateHealth(newHealth: number): void {
    this.healthText.text = newHealth
  }

  private async loadPortraitImage() {
    this.portrait.texture = await PIXI.Assets.load(
      `./media/images/cardimages/${this.minion.fileName}.jpg`
    )
  }

  private setupAttack(): void {
    this.attackText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.attackText.anchor.set(0.5)
    this.attackText.position.set(
      -this.frame.width / 2 + 36,
      this.frame.height / 2 - 51
    )
    this.addChild(this.attackText)

    this.updateAttack(this.minion.attack)
  }

  private setupHealth(): void {
    this.healthText = new PIXI.Text({
      text: '',
      style: this.statTextStyle,
    })
    this.healthText.anchor.set(0.5)
    this.healthText.position.set(
      this.frame.width / 2 - 29,
      this.frame.height / 2 - 51
    )
    this.addChild(this.healthText)

    this.updateHealth(this.minion.health)
  }
}

export default MinionBoardView
