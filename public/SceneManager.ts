import FontFaceObserver from 'fontfaceobserver'
import * as THREE from 'three'

// Logical game dimensions (16:9 ratio)
const GAME_WIDTH = 16
const GAME_HEIGHT = 9

export default class SceneManager {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private sceneRoot: THREE.Object3D
  private gameplayArea: THREE.Mesh

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true,
    })

    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace

    this.scene = new THREE.Scene()
    this.sceneRoot = new THREE.Object3D()
    this.sceneRoot.name = 'sceneRoot'
    this.scene.add(this.sceneRoot)

    this.setupCamera()
    this.updateViewport()
    this.setupResizeHandler()
  }

  public async initialize(): Promise<void> {
    await new FontFaceObserver('Belwe').load()
    this.createLighting()
    this.createGameplayArea()
  }

  private setupCamera(): void {
    this.camera = new THREE.OrthographicCamera(
      -GAME_WIDTH / 2, // -8
      GAME_WIDTH / 2, // 8
      GAME_HEIGHT / 2, // 4.5
      -GAME_HEIGHT / 2, // -4.5
      0.1,
      100
    )

    this.camera.position.set(0, 0, 50) // Center camera
    this.camera.lookAt(0, 0, 0)
  }

  private updateViewport(): void {
    const aspect = GAME_WIDTH / GAME_HEIGHT
    const windowAspect = window.innerWidth / window.innerHeight

    if (windowAspect > aspect) {
      // Letterbox (black bars on sides)
      const width = window.innerHeight * aspect
      const x = (window.innerWidth - width) / 2
      this.renderer.setViewport(x, 0, width, window.innerHeight)
    } else {
      // Pillarbox (black bars on top/bottom)
      const height = window.innerWidth / aspect
      const y = (window.innerHeight - height) / 2
      this.renderer.setViewport(0, y, window.innerWidth, height)
    }
  }

  private createLighting(): void {
    // Ambient light for basic illumination
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8))

    // Directional light with shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(-1, -1, 2)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.camera.near = 0.1
    dirLight.shadow.camera.far = 500
    this.scene.add(dirLight)
  }

  private createGameplayArea(): void {
    new THREE.TextureLoader().load(
      './media/images/maps/Uldaman_Board.png',
      (texture) => {
        this.gameplayArea = new THREE.Mesh(
          new THREE.PlaneGeometry(GAME_WIDTH, GAME_HEIGHT),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
          })
        )
        this.gameplayArea.position.set(0, 0, 0)
        this.sceneRoot.add(this.gameplayArea)
      }
    )
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.updateViewport()
    })
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCamera(): THREE.OrthographicCamera {
    return this.camera
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera)
  }
}
