import * as THREE from 'three'
import AttackIndicator from './AttackIndicator.ts'
import HealthIndicator from './HealthIndicator.ts'
import { HERO_HEIGHT, HERO_WIDTH } from './gameConstants.ts'

interface HeroData {
  id?: number
  attack?: number
  health?: number
  maxHealth?: number
}

export default class Hero {
  // Logical unit constants
  private static readonly CANVAS_SCALE = 256 // Pixels per logical unit
  private static readonly ICON_SIZE_RATIO = 0.25 // Icon size as fraction of hero width
  private static readonly INDICATOR_PADDING = 0.05 // Padding as fraction of hero width for indicator overhang

  public id: number
  public heroData: HeroData
  public mesh: THREE.Mesh
  public originalPosition: THREE.Vector3

  private scene: THREE.Scene
  private attackIndicator: AttackIndicator
  private healthIndicator: HealthIndicator

  // For texture loading promises
  private portraitTexture: THREE.Texture | null = null
  private texturesLoaded: Promise<void>

  constructor(
    scene: THREE.Scene,
    heroData: HeroData = {},
    position?: THREE.Vector3
  ) {
    this.scene = scene
    this.id = heroData.id || -1
    this.heroData = {
      id: heroData.id || -1,
      attack: heroData.attack || 0,
      health: heroData.health || 30,
      maxHealth: heroData.maxHealth || 30,
    }

    // Create indicator components
    this.attackIndicator = new AttackIndicator()
    this.healthIndicator = new HealthIndicator()

    // Create temporary invisible mesh until textures are loaded
    const tempGeometry = new THREE.PlaneGeometry(HERO_WIDTH, HERO_HEIGHT)
    const tempMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    })

    this.mesh = new THREE.Mesh(tempGeometry, tempMaterial)
    this.mesh.name = 'hero'
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
        './media/images/jaina_portrait.png',
        (texture) => {
          texture.offset.set(0.0, 0.0)
          resolve(texture)
        },
        undefined,
        reject
      )
    })

    try {
      this.portraitTexture = await portraitPromise
    } catch (error) {
      console.error('Error loading hero portrait texture:', error)
    }
  }

  private async compileTextures(): Promise<void> {
    // Create a large canvas to composite everything
    const compositeCanvas = document.createElement('canvas')
    const paddingPixels =
      HERO_WIDTH * Hero.INDICATOR_PADDING * Hero.CANVAS_SCALE
    const canvasWidth = HERO_WIDTH * Hero.CANVAS_SCALE + paddingPixels * 2
    const canvasHeight = HERO_HEIGHT * Hero.CANVAS_SCALE + paddingPixels * 2

    compositeCanvas.width = canvasWidth
    compositeCanvas.height = canvasHeight

    const ctx = compositeCanvas.getContext('2d')
    if (!ctx) return

    // Calculate hero dimensions and offset for centering
    const heroWidth = HERO_WIDTH * Hero.CANVAS_SCALE
    const heroHeight = HERO_HEIGHT * Hero.CANVAS_SCALE
    const heroOffsetX = paddingPixels
    const heroOffsetY = paddingPixels

    // Position indicators relative to the hero portrait
    const positions = {
      topRight: {
        x: heroOffsetX + heroWidth * 0.75,
        y: heroOffsetY + heroHeight * 0.1,
      },
      bottomRight: {
        x: heroOffsetX + heroWidth * 0.75,
        y: heroOffsetY + heroHeight * 0.75,
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
        ctx.drawImage(image, heroOffsetX, heroOffsetY, heroWidth, heroHeight)
      }
    }

    // Draw indicators using the indicator components
    const attackCanvas = await this.attackIndicator.renderToCanvas(
      this.heroData.attack || 0
    )
    const healthCanvas = await this.healthIndicator.renderToCanvas(
      this.heroData.health || 30
    )

    const size = HERO_WIDTH * Hero.ICON_SIZE_RATIO * Hero.CANVAS_SCALE

    // Draw attack indicator (top right)
    if (this.heroData.attack && this.heroData.attack > 0) {
      ctx.drawImage(
        attackCanvas,
        positions.topRight.x,
        positions.topRight.y,
        size,
        size
      )
    }

    // Draw health indicator (bottom right)
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
    const paddingAmount = HERO_WIDTH * Hero.INDICATOR_PADDING * 2
    const geometryWidth = HERO_WIDTH + paddingAmount
    const geometryHeight = HERO_HEIGHT + paddingAmount
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

  public setDepth(depth: number): void {
    this.mesh.position.z = depth
  }

  public getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const box = new THREE.Box3().setFromObject(this.mesh)
    return { min: box.min, max: box.max }
  }

  public updateAttack(newAttack: number): void {
    this.heroData.attack = newAttack
    this.compileTextures()
  }

  public updateHealth(newHealth: number): void {
    this.heroData.health = newHealth
    this.compileTextures()
  }

  public updateMaxHealth(newMaxHealth: number): void {
    this.heroData.maxHealth = newMaxHealth
    this.compileTextures()
  }

  public updateFromServerData(data: any): void {
    this.id = data.id
    this.heroData.id = data.id
    if (data.attack !== undefined) {
      this.heroData.attack = data.attack
    }
    if (data.health !== undefined) {
      this.heroData.health = data.health
    }
    if (data.maxHealth !== undefined) {
      this.heroData.maxHealth = data.maxHealth
    }
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
