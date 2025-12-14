import * as THREE from 'three'
import { DragEvent, Draggable } from './Draggable.ts'
import MinionModel from './MinionModel.ts'
import { CARD_HEIGHT, CARD_WIDTH } from './main.ts'

enum Layer {
  PORTRAIT = 0,
  FRAME = 0.1,
  OVERLAY_ICONS = 0.2,
  OVERLAY_TEXT = 0.3,
  CLICKABLE_AREA = 0.4,
}

export default class MinionCardView implements Draggable {
  public minion: MinionModel
  public mesh: THREE.Mesh // Now the single composite mesh
  public originalPosition: THREE.Vector3

  private scene: THREE.Scene
  private manaCanvas: HTMLCanvasElement
  private attackCanvas: HTMLCanvasElement
  private healthCanvas: HTMLCanvasElement
  private manaTexture: THREE.CanvasTexture
  private attackTexture: THREE.CanvasTexture
  private healthTexture: THREE.CanvasTexture

  // For texture loading promises
  private portraitTexture: THREE.Texture | null = null
  private frameTexture: THREE.Texture | null = null
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
    this.texturesLoaded.then(() => {
      this.compileTextures()
    })
  }

  private async loadAllTextures(): Promise<void> {
    const loader = new THREE.TextureLoader()

    // Load portrait texture
    const portraitPromise = new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        './media/images/cardimages/cairne_bloodhoof.jpg',
        (texture) => {
          texture.offset.set(0.2, 0.1)
          resolve(texture)
        },
        undefined,
        reject
      )
    })

    // Load frame texture
    const framePromise = new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        './media/images/card_inhand_minion_priest_frame.png',
        resolve,
        undefined,
        reject
      )
    })

    // Wait for both textures to load
    try {
      const [portrait, frame] = await Promise.all([
        portraitPromise,
        framePromise,
      ])
      this.portraitTexture = portrait
      this.frameTexture = frame

      // Create text textures
      await this.createOverlayElements()
    } catch (error) {
      console.error('Error loading card textures:', error)
    }
  }

  private compileTextures(): void {
    // Create a large canvas to composite everything
    const compositeCanvas = document.createElement('canvas')
    const canvasWidth = 512
    const canvasHeight = Math.floor(canvasWidth * (CARD_HEIGHT / CARD_WIDTH)) // Maintain aspect ratio

    compositeCanvas.width = canvasWidth
    compositeCanvas.height = canvasHeight

    const ctx = compositeCanvas.getContext('2d')
    if (!ctx) return

    // Calculate dimensions and positions for each element
    const portraitHeight = canvasHeight * 0.8 // Portrait takes 80% of card height
    const portraitY = canvasHeight * 0.1 // Start 10% from top

    // Draw portrait (background layer)
    if (this.portraitTexture && this.portraitTexture.image) {
      const image = this.portraitTexture.image
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
        ctx.drawImage(image, 0, portraitY, canvasWidth, portraitHeight)
      }
    }

    // Draw frame (overlay layer)
    if (this.frameTexture && this.frameTexture.image) {
      const image = this.portraitTexture.image
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight)
      }
    }

    // Draw text overlays
    this.drawTextOverlay(ctx, this.manaCanvas, 32, 32) // Top-left
    this.drawTextOverlay(ctx, this.attackCanvas, 32, canvasHeight - 96) // Bottom-left
    this.drawTextOverlay(
      ctx,
      this.healthCanvas,
      canvasWidth - 96,
      canvasHeight - 96
    ) // Bottom-right

    // Create the final composite texture and mesh
    const compositeTexture = new THREE.CanvasTexture(compositeCanvas)
    compositeTexture.needsUpdate = true

    const geometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT)
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

  private drawTextOverlay(
    ctx: CanvasRenderingContext2D,
    textCanvas: HTMLCanvasElement,
    x: number,
    y: number
  ): void {
    if (textCanvas) {
      ctx.drawImage(textCanvas, x, y, 64, 64)
    }
  }

  private createCanvasTexture(
    width: number = 256,
    height: number = 256
  ): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    return { canvas, texture }
  }

  private async createOverlayElements(): Promise<void> {
    // Create text canvases
    const manaResult = this.createCanvasTexture()
    this.manaCanvas = manaResult.canvas
    this.manaTexture = manaResult.texture

    const attackResult = this.createCanvasTexture()
    this.attackCanvas = attackResult.canvas
    this.attackTexture = attackResult.texture

    const healthResult = this.createCanvasTexture()
    this.healthCanvas = healthResult.canvas
    this.healthTexture = healthResult.texture

    // Generate text on canvases (but don't create separate meshes)
    this.updateMana(4)
    this.updateAttack(2)
    this.updateHealth(5)
  }

  public setCardDepth(depth: number): void {
    this.mesh.position.z = depth
  }

  public transformToHand(): void {
    this.mesh.scale.set(1, 1, 1)
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
    if (!this.manaCanvas) return

    const ctx = this.manaCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, this.manaCanvas.width, this.manaCanvas.height)
    ctx.font = 'bold 120px Arial'
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const text = newMana.toString()
    const x = this.manaCanvas.width / 2
    const y = this.manaCanvas.height / 2

    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)

    this.manaTexture.needsUpdate = true

    // Recompile if textures are loaded
    if (this.portraitTexture && this.frameTexture) {
      this.compileTextures()
    }
  }

  public updateAttack(newAttack: number): void {
    if (!this.attackCanvas) return

    const ctx = this.attackCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, this.attackCanvas.width, this.attackCanvas.height)
    ctx.font = 'bold 120px Arial'
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const text = newAttack.toString()
    const x = this.attackCanvas.width / 2
    const y = this.attackCanvas.height / 2

    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)

    this.attackTexture.needsUpdate = true

    // Recompile if textures are loaded
    if (this.portraitTexture && this.frameTexture) {
      this.compileTextures()
    }
  }

  public updateHealth(newHealth: number): void {
    if (!this.healthCanvas) return

    const ctx = this.healthCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, this.healthCanvas.width, this.healthCanvas.height)
    ctx.font = 'bold 120px Arial'
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 4
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const text = newHealth.toString()
    const x = this.healthCanvas.width / 2
    const y = this.healthCanvas.height / 2

    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)

    this.healthTexture.needsUpdate = true

    // Recompile if textures are loaded
    if (this.portraitTexture && this.frameTexture) {
      this.compileTextures()
    }
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
    if (this.manaTexture) {
      this.manaTexture.dispose()
    }
    if (this.attackTexture) {
      this.attackTexture.dispose()
    }
    if (this.healthTexture) {
      this.healthTexture.dispose()
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

    this.scene.remove(this.mesh)
  }
}
