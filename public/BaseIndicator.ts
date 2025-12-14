import * as THREE from 'three'
import { CARD_WIDTH } from './gameConstants.ts'

export default abstract class BaseIndicator {
  private static readonly CANVAS_SCALE = 256 // Pixels per logical unit
  private static readonly TEXT_CANVAS_RATIO = 0.4 // Text canvas size as fraction of card width

  private iconTexture: THREE.Texture | null = null
  private canvas: HTMLCanvasElement
  private isLoaded: boolean = false

  constructor() {
    // Create the canvas for this indicator
    const canvasSize =
      CARD_WIDTH * BaseIndicator.TEXT_CANVAS_RATIO * BaseIndicator.CANVAS_SCALE
    this.canvas = document.createElement('canvas')
    this.canvas.width = canvasSize
    this.canvas.height = canvasSize

    // Load the icon texture
    this.loadIcon()
  }

  protected abstract getIconPath(): string

  private async loadIcon(): Promise<void> {
    const loader = new THREE.TextureLoader()

    return new Promise((resolve, reject) => {
      loader.load(
        this.getIconPath(),
        (texture) => {
          this.iconTexture = texture
          this.isLoaded = true
          resolve()
        },
        undefined,
        reject
      )
    })
  }

  public async renderToCanvas(value: number): Promise<HTMLCanvasElement> {
    // Wait for icon to load if not already loaded
    if (!this.isLoaded) {
      await this.loadIcon()
    }

    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas')
    }

    // Clear the canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw the icon if loaded
    if (this.iconTexture && this.iconTexture.image) {
      const image = this.iconTexture.image
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
        ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height)
      }
    }

    // Draw the text over the icon
    this.drawText(ctx, value)

    return this.canvas
  }

  private drawText(ctx: CanvasRenderingContext2D, value: number): void {
    ctx.font = 'bold 140px Belwe'
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const text = value.toString()
    const x = this.canvas.width / 2
    const y = this.canvas.height / 2

    // Draw stroke first, then fill
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
  }

  public dispose(): void {
    if (this.iconTexture) {
      this.iconTexture.dispose()
      this.iconTexture = null
    }
  }
}
