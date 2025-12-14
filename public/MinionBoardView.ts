import * as THREE from 'three'
import MinionModel from './MinionModel.ts'
import { MINION_BOARD_HEIGHT, MINION_BOARD_WIDTH } from './main.ts'

enum Layer {
  PORTRAIT = 0,
  FRAME = 0.1,
  OVERLAY_ICONS = 0.2,
  OVERLAY_TEXT = 0.3,
  CLICKABLE_AREA = 0.4,
}

export default class MinionBoardView {
  public minion: MinionModel
  public mesh: THREE.Object3D

  private scene: THREE.Scene
  private frame: THREE.Mesh
  private attackCanvas: HTMLCanvasElement
  private healthCanvas: HTMLCanvasElement
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
    this.mesh.name = 'minionBoard'
    scene.add(this.mesh)

    if (position) {
      this.mesh.position.copy(position)
    }

    this.createCardMesh()
  }

  private createCardMesh(): void {
    const loader = new THREE.TextureLoader()

    // Portrait
    loader.load(
      './media/images/cardimages/cairne_bloodhoof.jpg',
      (texture) => {
        texture.offset.set(0.2, 0.1)

        const portraitGeometry = new THREE.PlaneGeometry(
          MINION_BOARD_WIDTH,
          MINION_BOARD_HEIGHT * 0.8
        ) // Portrait area
        const portraitMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
        })

        const portrait = new THREE.Mesh(portraitGeometry, portraitMaterial)
        portrait.name = 'portrait'
        portrait.position.set(0, 0, Layer.PORTRAIT)
        this.mesh.add(portrait)
      },
      undefined,
      (error) => {
        console.log('Error loading portrait texture:', error)
      }
    )

    // Frame
    loader.load(
      './media/images/empty_minion_board_frame.png',
      (texture) => {
        const frameMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
          side: THREE.DoubleSide,
        })

        const frameGeometry = new THREE.PlaneGeometry(
          MINION_BOARD_WIDTH,
          MINION_BOARD_HEIGHT
        ) // Full minion size
        this.frame = new THREE.Mesh(frameGeometry, frameMaterial)
        this.frame.name = 'frame'
        this.frame.position.set(0, 0, Layer.FRAME)
        this.mesh.add(this.frame)

        // Clickable area
        const clickableGeometry = new THREE.PlaneGeometry(
          MINION_BOARD_WIDTH * 1.1,
          MINION_BOARD_HEIGHT * 1.1
        ) // Slightly larger
        const clickableMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
        })

        const clickableArea = new THREE.Mesh(
          clickableGeometry,
          clickableMaterial
        )
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
    const attackResult = this.createCanvasTexture()
    this.attackCanvas = attackResult.canvas
    this.attackTexture = attackResult.texture

    const healthResult = this.createCanvasTexture()
    this.healthCanvas = healthResult.canvas
    this.healthTexture = healthResult.texture

    // Create simple stat displays
    this.setupAttack()
    this.setupHealth()
  }

  private createTextPlane(
    texture: THREE.CanvasTexture,
    position: THREE.Vector3
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)
    this.mesh.add(mesh)

    return mesh
  }

  private setupAttack(): void {
    this.updateAttack(2)
    this.createTextPlane(
      this.attackTexture,
      new THREE.Vector3(-1.5, -1.5, Layer.OVERLAY_TEXT)
    )
  }

  private setupHealth(): void {
    this.updateHealth(5)
    this.createTextPlane(
      this.healthTexture,
      new THREE.Vector3(1.5, -1.5, Layer.OVERLAY_TEXT)
    )
  }

  public setCardDepth(depth: number): void {
    this.mesh.position.z = depth
  }

  public transformToBoard(): void {
    this.mesh.scale.set(1, 1, 1)
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
