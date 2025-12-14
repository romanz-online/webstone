import * as THREE from 'three'
import MinionModel from './MinionModel.ts'

enum Layer {
  PORTRAIT = 0,
  FRAME = 0.1,
  OVERLAY_ICONS = 0.2,
  OVERLAY_TEXT = 0.3,
  CLICKABLE_AREA = 0.4,
}

export default class MinionCardView {
  public static draggedCard: MinionCardView | null = null

  public minion: MinionModel
  public mesh: THREE.Object3D
  public frame: THREE.Mesh
  public originalPosition: THREE.Vector3
  public dragOffset: THREE.Vector3 | null = null
  // public isEnlarged: boolean = false

  private scene: THREE.Scene
  private manaCanvas: HTMLCanvasElement
  private attackCanvas: HTMLCanvasElement
  private healthCanvas: HTMLCanvasElement
  private manaTexture: THREE.CanvasTexture
  private attackTexture: THREE.CanvasTexture
  private healthTexture: THREE.CanvasTexture

  constructor(
    scene: THREE.Scene,
    minion: MinionModel,
    position?: THREE.Vector3
  ) {
    this.scene = scene
    this.minion = minion

    this.mesh = new THREE.Object3D()
    this.mesh.name = 'minionCard'
    scene.add(this.mesh)

    if (position) {
      this.mesh.position.copy(position)
    }

    this.originalPosition = this.mesh.position.clone()

    this.createCardMesh()
  }

  private createCardMesh(): void {
    const loader = new THREE.TextureLoader()

    // Portrait
    loader.load(
      './media/images/cardimages/cairne_bloodhoof.jpg',
      (texture) => {
        texture.offset.set(0.2, 0.1)

        const portraitGeometry = new THREE.PlaneGeometry(240, 240 * 0.8) // Approximate ratio
        const portraitMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
        })

        const portrait = new THREE.Mesh(portraitGeometry, portraitMaterial)
        portrait.name = 'portrait'
        portrait.position.set(0, 1.15, Layer.PORTRAIT)
        this.mesh.add(portrait)
      },
      undefined,
      (error) => {
        console.log('Error loading portrait texture:', error)
      }
    )

    // Frame
    loader.load(
      './media/images/card_inhand_minion_priest_frame.png',
      (texture) => {
        const frameMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide,
        })

        const frameGeometry = new THREE.PlaneGeometry(240, 240 * 1.5) // Approximate ratio
        this.frame = new THREE.Mesh(frameGeometry, frameMaterial)
        this.frame.name = 'frame'
        this.frame.position.set(0, 0, Layer.FRAME)
        this.mesh.add(this.frame)

        // Clickable area
        const clickableMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        })

        const clickableArea = new THREE.Mesh(frameGeometry, clickableMaterial)
        clickableArea.name = 'clickableArea'
        clickableArea.position.set(0, 0, Layer.CLICKABLE_AREA)
        clickableArea.userData = { owner: this }
        this.mesh.add(clickableArea)

        this.createOverlayElements()
      },
      undefined,
      (error) => {
        console.log('Error loading frame texture:', error)
      }
    )
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

    // Create simple stat displays
    this.setupMana()
    this.setupAttack()
    this.setupHealth()
  }

  private createTextPlane(
    texture: THREE.CanvasTexture,
    position: THREE.Vector3
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(0.8, 0.8)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)
    this.mesh.add(mesh)

    return mesh
  }

  // Simplified - no name banner for now

  private setupMana(): void {
    this.updateMana(4)
    this.createTextPlane(
      this.manaTexture,
      new THREE.Vector3(-1.5, 2.5, Layer.OVERLAY_TEXT)
    )
  }

  private setupAttack(): void {
    this.updateAttack(2)
    this.createTextPlane(
      this.attackTexture,
      new THREE.Vector3(-1.5, -2.5, Layer.OVERLAY_TEXT)
    )
  }

  private setupHealth(): void {
    this.updateHealth(5)
    this.createTextPlane(
      this.healthTexture,
      new THREE.Vector3(1.5, -2.5, Layer.OVERLAY_TEXT)
    )
  }

  // Name banner removed for simplicity

  public setCardDepth(depth: number): void {
    this.mesh.position.z = depth
  }

  public transformToHand(): void {
    this.mesh.scale.set(1, 1, 1)
  }

  public getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const box = new THREE.Box3().setFromObject(this.frame)
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
  }

  public dispose(): void {
    if (MinionCardView.draggedCard === this) {
      MinionCardView.draggedCard = null
    }

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
