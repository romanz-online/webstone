import * as THREE from 'three'
import {
  Layer,
  MINION_BOARD_WIDTH,
  MINION_BOARD_HEIGHT,
} from './gameConstants.ts'

export default class DamageIndicator {
  private static readonly EXPAND_DURATION = 250 // ms - fast pop-in
  private static readonly HOLD_DURATION = 1500 // ms - stay visible
  private static readonly FADE_DURATION = 2000 // ms - fade out
  private static readonly CANVAS_SIZE = 512 // Increased for better quality
  private static readonly BOARD_SIZE_RATIO = 0.65 // 65% of minion board

  private static damageImageCache: HTMLImageElement | null = null
  private static imageLoadPromise: Promise<HTMLImageElement> | null = null

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
    this.startPosition = position.clone()
    this.startTime = Date.now()

    // Initialize sprite asynchronously
    this.initializeSprite(damageAmount, isHealing)
  }

  private static async loadDamageImage(): Promise<HTMLImageElement> {
    // Return cached image if available
    if (DamageIndicator.damageImageCache) {
      return DamageIndicator.damageImageCache
    }

    // Return existing promise if already loading
    if (DamageIndicator.imageLoadPromise) {
      return DamageIndicator.imageLoadPromise
    }

    // Create new loading promise
    DamageIndicator.imageLoadPromise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        DamageIndicator.damageImageCache = img
        DamageIndicator.imageLoadPromise = null
        resolve(img)
      }
      img.onerror = (error) => {
        DamageIndicator.imageLoadPromise = null
        reject(new Error(`Failed to load damage indicator image: ${error}`))
      }
      img.src = '/media/images/indicators/damage.png'
    })

    return DamageIndicator.imageLoadPromise
  }

  private async initializeSprite(
    damageAmount: number,
    isHealing: boolean
  ): Promise<void> {
    try {
      // Create text texture with background image
      const texture = await this.createTextTexture(damageAmount, isHealing)

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

      // Calculate target size (65% of minion board)
      const targetWidth = MINION_BOARD_WIDTH * DamageIndicator.BOARD_SIZE_RATIO
      const targetHeight =
        MINION_BOARD_HEIGHT * DamageIndicator.BOARD_SIZE_RATIO
      this.sprite.scale.set(targetWidth, targetHeight, 1)

      // Start at scale 0 for expand animation
      this.sprite.scale.multiplyScalar(0)

      this.scene.add(this.sprite)

      // Start animation
      this.animate()
    } catch (error) {
      console.error('Failed to create damage indicator:', error)
      // Clean up if initialization fails
      this.dispose()
    }
  }

  private async createTextTexture(
    amount: number,
    isHealing: boolean
  ): Promise<THREE.CanvasTexture> {
    // Load damage.png
    const damageImage = await DamageIndicator.loadDamageImage()

    const canvas = document.createElement('canvas')
    canvas.width = DamageIndicator.CANVAS_SIZE
    canvas.height = DamageIndicator.CANVAS_SIZE

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Draw background image centered with aspect ratio preserved
    const imageAspect = damageImage.width / damageImage.height
    let drawWidth = canvas.width
    let drawHeight = canvas.height
    let offsetX = 0
    let offsetY = 0

    if (imageAspect > 1) {
      // Image is wider than tall
      drawHeight = canvas.width / imageAspect
      offsetY = (canvas.height - drawHeight) / 2
    } else {
      // Image is taller than wide (or square)
      drawWidth = canvas.height * imageAspect
      offsetX = (canvas.width - drawWidth) / 2
    }
    ctx.drawImage(damageImage, offsetX, offsetY, drawWidth, drawHeight)

    // Draw text on top (same styling as before)
    ctx.font = 'bold 140px Belwe'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Set color based on damage or healing
    const fillColor = isHealing ? '#00cc00' : '#ffffff'
    const strokeColor = isHealing ? '#004400' : '#000000'

    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 8

    // Draw text centered
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
    const totalDuration =
      DamageIndicator.EXPAND_DURATION +
      DamageIndicator.HOLD_DURATION +
      DamageIndicator.FADE_DURATION

    // Determine current phase
    if (elapsed < DamageIndicator.EXPAND_DURATION) {
      // Phase 1: Expand (0ms - 250ms)
      this.animateExpand(elapsed)
    } else if (
      elapsed <
      DamageIndicator.EXPAND_DURATION + DamageIndicator.HOLD_DURATION
    ) {
      // Phase 2: Hold (250ms - 2250ms)
      this.animateHold()
    } else if (elapsed < totalDuration) {
      // Phase 3: Fade (2250ms - 3250ms)
      const fadeElapsed =
        elapsed - DamageIndicator.EXPAND_DURATION - DamageIndicator.HOLD_DURATION
      this.animateFade(fadeElapsed)
    } else {
      // Animation complete
      this.dispose()
      return
    }

    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  private animateExpand(elapsed: number): void {
    const progress = Math.min(elapsed / DamageIndicator.EXPAND_DURATION, 1)

    // Cubic ease-out (same as AttackAnimationSystem)
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    // Scale from 0 to target size
    const targetWidth = MINION_BOARD_WIDTH * DamageIndicator.BOARD_SIZE_RATIO
    const targetHeight = MINION_BOARD_HEIGHT * DamageIndicator.BOARD_SIZE_RATIO

    this.sprite.scale.set(
      targetWidth * easeProgress,
      targetHeight * easeProgress,
      1
    )

    // Keep fully opaque during expand
    if (this.sprite.material instanceof THREE.SpriteMaterial) {
      this.sprite.material.opacity = 1.0
    }
  }

  private animateHold(): void {
    // Keep at full size and full opacity
    const targetWidth = MINION_BOARD_WIDTH * DamageIndicator.BOARD_SIZE_RATIO
    const targetHeight = MINION_BOARD_HEIGHT * DamageIndicator.BOARD_SIZE_RATIO

    this.sprite.scale.set(targetWidth, targetHeight, 1)

    if (this.sprite.material instanceof THREE.SpriteMaterial) {
      this.sprite.material.opacity = 1.0
    }
  }

  private animateFade(fadeElapsed: number): void {
    const progress = Math.min(fadeElapsed / DamageIndicator.FADE_DURATION, 1)

    // Linear fade out
    const opacity = 1.0 - progress

    // Keep scale at target size
    const targetWidth = MINION_BOARD_WIDTH * DamageIndicator.BOARD_SIZE_RATIO
    const targetHeight = MINION_BOARD_HEIGHT * DamageIndicator.BOARD_SIZE_RATIO

    this.sprite.scale.set(targetWidth, targetHeight, 1)

    if (this.sprite.material instanceof THREE.SpriteMaterial) {
      this.sprite.material.opacity = opacity
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
