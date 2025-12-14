import * as THREE from 'three'
import AttackIndicator from './AttackIndicator.ts'
import HealthIndicator from './HealthIndicator.ts'
import MinionModel from './MinionModel.ts'
import { MINION_BOARD_HEIGHT, MINION_BOARD_WIDTH } from './gameConstants.ts'

export default class MinionBoardView {
  // Logical unit constants
  private static readonly CANVAS_SCALE = 256 // Pixels per logical unit
  private static readonly ICON_SIZE_RATIO = 0.25 // Icon size as fraction of board width
  private static readonly INDICATOR_PADDING = 0.05 // Padding as fraction of board width for indicator overhang

  public minion: MinionModel
  public mesh: THREE.Mesh
  public originalPosition: THREE.Vector3

  private scene: THREE.Scene
  private attackIndicator: AttackIndicator
  private healthIndicator: HealthIndicator

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

    // Create indicator components
    this.attackIndicator = new AttackIndicator()
    this.healthIndicator = new HealthIndicator()

    // Create temporary invisible mesh until textures are loaded
    const tempGeometry = new THREE.PlaneGeometry(
      MINION_BOARD_WIDTH,
      MINION_BOARD_HEIGHT
    )
    const tempMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    })

    this.mesh = new THREE.Mesh(tempGeometry, tempMaterial)
    this.mesh.name = 'minionBoard'
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
        './media/images/empty_minion_board_frame.png',
        resolve,
        undefined,
        reject
      )
    })

    try {
      const [portrait, frame] = await Promise.all([
        portraitPromise,
        framePromise,
      ])
      this.portraitTexture = portrait
      this.frameTexture = frame
    } catch (error) {
      console.error('Error loading board textures:', error)
    }
  }

  private async compileTextures(): Promise<void> {
    // Create a large canvas to composite everything
    const compositeCanvas = document.createElement('canvas')
    const paddingPixels =
      MINION_BOARD_WIDTH *
      MinionBoardView.INDICATOR_PADDING *
      MinionBoardView.CANVAS_SCALE
    const canvasWidth =
      MINION_BOARD_WIDTH * MinionBoardView.CANVAS_SCALE + paddingPixels * 2
    const canvasHeight =
      MINION_BOARD_HEIGHT * MinionBoardView.CANVAS_SCALE + paddingPixels * 2

    compositeCanvas.width = canvasWidth
    compositeCanvas.height = canvasHeight

    const ctx = compositeCanvas.getContext('2d')
    if (!ctx) return

    // Calculate board dimensions (original size) and offset for centering
    const boardWidth = MINION_BOARD_WIDTH * MinionBoardView.CANVAS_SCALE
    const boardHeight = MINION_BOARD_HEIGHT * MinionBoardView.CANVAS_SCALE
    const boardOffsetX = paddingPixels
    const boardOffsetY = paddingPixels

    // Position indicators relative to the board, allowing for overhang
    const positions = {
      bottomLeft: {
        x: boardOffsetX + boardWidth * 0.0,
        y: boardOffsetY + boardHeight * 0.7,
      },
      bottomRight: {
        x: boardOffsetX + boardWidth * 0.75,
        y: boardOffsetY + boardHeight * 0.7,
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
          boardOffsetX,
          boardOffsetY + boardHeight * 0.1,
          boardWidth,
          boardHeight * 0.8
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
        ctx.drawImage(
          image,
          boardOffsetX,
          boardOffsetY,
          boardWidth,
          boardHeight
        )
      }
    }

    // Draw indicators using the indicator components (no mana for board minions)
    const attackCanvas = await this.attackIndicator.renderToCanvas(
      this.minion.attack || 2
    )
    const healthCanvas = await this.healthIndicator.renderToCanvas(
      this.minion.health || 5
    )

    const size =
      MINION_BOARD_WIDTH *
      MinionBoardView.ICON_SIZE_RATIO *
      MinionBoardView.CANVAS_SCALE

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
    const paddingAmount =
      MINION_BOARD_WIDTH * MinionBoardView.INDICATOR_PADDING * 2
    const geometryWidth = MINION_BOARD_WIDTH + paddingAmount
    const geometryHeight = MINION_BOARD_HEIGHT + paddingAmount
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

  public setCardDepth(depth: number): void {
    this.mesh.position.z = depth
  }

  public transformToBoard(): void {
    this.mesh.scale.set(1, 1, 1)
  }

  public getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const box = new THREE.Box3().setFromObject(this.mesh)
    return { min: box.min, max: box.max }
  }

  public updateAttack(newAttack: number): void {
    this.minion.attack = newAttack
    this.compileTextures()
  }

  public updateHealth(newHealth: number): void {
    this.minion.health = newHealth
    this.compileTextures()
  }

  public dispose(): void {
    // Dispose indicator components
    this.attackIndicator.dispose()
    this.healthIndicator.dispose()

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
