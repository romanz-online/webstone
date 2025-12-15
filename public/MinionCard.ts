import * as THREE from 'three'
import AttackIndicator from './AttackIndicator.ts'
import { DragEvent, Draggable } from './Draggable.ts'
import { CARD_HEIGHT, CARD_WIDTH } from './gameConstants.ts'
import HealthIndicator from './HealthIndicator.ts'
import ManaIndicator from './ManaIndicator.ts'
import MinionModel from './MinionModel.ts'

export default class MinionCard implements Draggable {
  // Logical unit constants
  private static readonly CANVAS_SCALE = 256 // Pixels per logical unit
  private static readonly ICON_SIZE_RATIO = 0.25 // Text size as fraction of card width
  private static readonly INDICATOR_PADDING = 0.05 // Padding as fraction of card width for indicator overhang

  public minion: MinionModel
  public mesh: THREE.Mesh
  public originalPosition: THREE.Vector3

  private scene: THREE.Scene

  // For texture loading promises
  private portraitTexture: THREE.Texture | null = null
  private frameTexture: THREE.Texture | null = null
  private nameTexture: THREE.Texture | null = null
  private texturesLoaded: Promise<void>

  constructor(
    scene: THREE.Scene,
    minion: MinionModel,
    position?: THREE.Vector3
  ) {
    this.scene = scene
    this.minion = minion

    // Create temporary invisible mesh until textures are loaded
    const tempGeometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT)
    const tempMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    })

    this.mesh = new THREE.Mesh(tempGeometry, tempMaterial)
    this.mesh.name = 'minionCard'
    this.mesh.userData = { owner: this }
    scene.add(this.mesh)

    if (position) {
      this.mesh.position.copy(position)
    }

    this.originalPosition = this.mesh.position.clone()

    // Start loading textures and compile when ready
    this.texturesLoaded = this.loadAllTextures()
    this.texturesLoaded.then(async () => {
      await this.compileTextures()
    })
  }

  private async loadAllTextures(): Promise<void> {
    const loader = new THREE.TextureLoader()

    const portraitPromise = new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        './media/images/cardimages/cairne_bloodhoof.jpg',

        (texture) => {
          texture.offset.set(0.0, 0.0)
          resolve(texture)
        },
        undefined,
        reject
      )
    })

    const framePromise = new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        './media/images/card_inhand_minion_priest_frame.png',
        resolve,
        undefined,
        reject
      )
    })

    const namePromise = new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        './media/images/name-banner-minion.png',
        resolve,
        undefined,
        reject
      )
    })

    try {
      const [portrait, frame, name] = await Promise.all([
        portraitPromise,
        framePromise,
        namePromise,
      ])
      this.portraitTexture = portrait
      this.frameTexture = frame
      this.nameTexture = name
    } catch (error) {
      console.error('Error loading card textures:', error)
    }
  }

  private async compileTextures(): Promise<void> {
    // Create a large canvas to composite everything
    const compositeCanvas = document.createElement('canvas')
    const paddingPixels =
      CARD_WIDTH * MinionCard.INDICATOR_PADDING * MinionCard.CANVAS_SCALE
    const canvasWidth = CARD_WIDTH * MinionCard.CANVAS_SCALE + paddingPixels * 2
    const canvasHeight =
      CARD_HEIGHT * MinionCard.CANVAS_SCALE + paddingPixels * 2

    compositeCanvas.width = canvasWidth
    compositeCanvas.height = canvasHeight

    const ctx = compositeCanvas.getContext('2d')
    if (!ctx) return

    // Calculate card dimensions (original size) and offset for centering
    const cardWidth = CARD_WIDTH * MinionCard.CANVAS_SCALE
    const cardHeight = CARD_HEIGHT * MinionCard.CANVAS_SCALE
    const cardOffsetX = paddingPixels
    const cardOffsetY = paddingPixels

    // Position indicators relative to the card, allowing for overhang
    const positions = {
      topLeft: {
        x: cardOffsetX + cardWidth * -0.03,
        y: cardOffsetY + cardHeight * 0.04,
      },
      bottomLeft: {
        x: cardOffsetX + cardWidth * -0.03,
        y: cardOffsetY + cardHeight * 0.85,
      },
      bottomRight: {
        x: cardOffsetX + cardWidth * 0.82,
        y: cardOffsetY + cardHeight * 0.85,
      },
    }

    // Draw portrait (background layer)
    if (this.portraitTexture && this.portraitTexture.image) {
      const image = this.portraitTexture.image
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
        ctx.drawImage(
          image,
          cardOffsetX,
          cardOffsetY + cardHeight * 0.1,
          cardWidth,
          cardHeight * 0.8
        )
      }
    }

    // Draw frame (overlay layer)
    if (this.frameTexture && this.frameTexture.image) {
      const image = this.frameTexture.image
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
        ctx.drawImage(image, cardOffsetX, cardOffsetY, cardWidth, cardHeight)
      }
    }

    if (this.nameTexture && this.nameTexture.image) {
      const image = this.nameTexture.image
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
        ctx.drawImage(
          image,
          cardOffsetX + cardWidth * 0.025,
          cardOffsetY + cardHeight * 0.49,
          cardWidth * 0.95,
          cardHeight * 0.13
        )
      }
    }

    const manaCanvas = await new ManaIndicator().renderToCanvas(
      this.minion.mana || 4
    )
    const attackCanvas = await new AttackIndicator().renderToCanvas(
      this.minion.attack || 2
    )
    const healthCanvas = await new HealthIndicator().renderToCanvas(
      this.minion.health || 5
    )

    const size =
      CARD_WIDTH * MinionCard.ICON_SIZE_RATIO * MinionCard.CANVAS_SCALE

    // Draw mana indicator
    ctx.drawImage(
      manaCanvas,
      positions.topLeft.x,
      positions.topLeft.y,
      size,
      size
    )

    // Draw attack indicator
    ctx.drawImage(
      attackCanvas,
      positions.bottomLeft.x,
      positions.bottomLeft.y,
      size,
      size
    )

    // Draw health indicator
    ctx.drawImage(
      healthCanvas,
      positions.bottomRight.x,
      positions.bottomRight.y,
      size,
      size
    )

    // Create the final composite texture and mesh
    const compositeTexture = new THREE.CanvasTexture(compositeCanvas)
    compositeTexture.needsUpdate = true

    // Scale geometry to match the expanded canvas proportions
    const paddingAmount = CARD_WIDTH * MinionCard.INDICATOR_PADDING * 2
    const geometryWidth = CARD_WIDTH + paddingAmount
    const geometryHeight = CARD_HEIGHT + paddingAmount
    const geometry = new THREE.PlaneGeometry(geometryWidth, geometryHeight)
    const material = new THREE.MeshBasicMaterial({
      map: compositeTexture,
      transparent: true,
    })

    // Replace the temporary mesh with the composite one
    const oldGeometry = this.mesh.geometry
    const oldMaterial = this.mesh.material

    this.mesh.geometry = geometry
    this.mesh.material = material

    // Clean up old resources
    oldGeometry.dispose()
    if (Array.isArray(oldMaterial)) {
      oldMaterial.forEach((mat) => mat.dispose())
    } else {
      oldMaterial.dispose()
    }
  }

  public getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const box = new THREE.Box3().setFromObject(this.mesh)
    return { min: box.min, max: box.max }
  }

  public revert(): void {
    setTimeout(() => {
      const startPos = this.mesh.position.clone()
      const startTime = Date.now()
      const duration = 100 // ms

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        this.mesh.position.lerpVectors(
          startPos,
          this.originalPosition,
          progress
        )

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    }, 40)
  }

  public updateMana(newMana: number): void {
    this.minion.mana = newMana
    this.compileTextures()
  }

  public updateAttack(newAttack: number): void {
    this.minion.attack = newAttack
    this.compileTextures()
  }

  public updateHealth(newHealth: number): void {
    this.minion.health = newHealth
    this.compileTextures()
  }

  public isDraggable(): boolean {
    return true
  }

  public onDragStart(event: DragEvent): void {
    // Store original position for potential revert
    this.originalPosition = this.mesh.position.clone()

    // Raise card slightly to show it's being dragged
    this.mesh.position.z += 0.1

    // Optional: Scale up slightly for visual feedback
    this.mesh.scale.setScalar(1.05)
  }

  public onDrag(event: DragEvent): void {
    // The DragControls will handle position updates
    // We can add any additional visual feedback here
  }

  public onDragEnd(event: DragEvent): void {
    // Reset visual state
    this.mesh.scale.setScalar(1.0)
    this.mesh.position.z -= 0.1
  }

  public dispose(): void {
    // Remove from current parent (whether scene or hand)
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh)
    }

    // Dispose Three.js objects
    this.mesh.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose())
          } else {
            object.material.dispose()
          }
        }
        if (object.geometry) {
          object.geometry.dispose()
        }
      }
    })
  }
}
