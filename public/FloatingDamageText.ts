import * as THREE from 'three'
import { Layer } from './gameConstants.ts'

export default class FloatingDamageText {
  private static readonly ANIMATION_DURATION = 1000 // ms
  private static readonly DRIFT_DISTANCE = 0.5 // units
  private static readonly Y_OFFSET = 1.0 // Initial offset above character
  private static readonly CANVAS_SIZE = 256 // pixels

  private scene: THREE.Scene
  private sprite: THREE.Sprite
  private startPosition: THREE.Vector3
  private startTime: number
  private animationId: number | undefined

  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    damageAmount: number,
    isHealing: boolean = false
  ) {
    this.scene = scene
    this.startPosition = position
      .clone()
      .add(new THREE.Vector3(0, FloatingDamageText.Y_OFFSET, 0))
    this.startTime = Date.now()

    // Create text texture
    const texture = this.createTextTexture(damageAmount, isHealing)

    // Create sprite material with transparency
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1.0,
    })

    // Create sprite
    this.sprite = new THREE.Sprite(spriteMaterial)
    this.sprite.position.copy(this.startPosition)
    this.sprite.position.z = Layer.TARGETING_SYSTEM
    this.sprite.scale.set(0.5, 0.5, 1) // Scale down for better visibility
    this.scene.add(this.sprite)

    // Start animation
    this.animate()
  }

  private createTextTexture(
    amount: number,
    isHealing: boolean
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = FloatingDamageText.CANVAS_SIZE
    canvas.height = FloatingDamageText.CANVAS_SIZE

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Set text style
    ctx.font = 'bold 140px Belwe'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Set color based on damage or healing
    const fillColor = isHealing ? '#00cc00' : '#ffffff'
    const strokeColor = isHealing ? '#004400' : '#000000'

    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 8

    // Draw text
    const text = amount.toString()
    const x = canvas.width / 2
    const y = canvas.height / 2

    // Draw stroke first, then fill
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)

    // Create and return texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  private animate(): void {
    const elapsed = Date.now() - this.startTime
    const progress = Math.min(
      elapsed / FloatingDamageText.ANIMATION_DURATION,
      1
    )

    // Linear interpolation for upward drift
    const driftY = FloatingDamageText.DRIFT_DISTANCE * progress
    this.sprite.position.y = this.startPosition.y + driftY

    // Linear fade out
    const opacity = 1.0 - progress
    if (this.sprite.material instanceof THREE.SpriteMaterial) {
      this.sprite.material.opacity = opacity
    }

    if (progress < 1) {
      this.animationId = requestAnimationFrame(() => this.animate())
    } else {
      // Animation complete, dispose
      this.dispose()
    }
  }

  private dispose(): void {
    // Cancel animation if still running
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
    }

    // Dispose sprite material and texture
    if (this.sprite.material instanceof THREE.SpriteMaterial) {
      if (this.sprite.material.map) {
        this.sprite.material.map.dispose()
      }
      this.sprite.material.dispose()
    }

    // Remove from scene
    this.scene.remove(this.sprite)
  }
}
