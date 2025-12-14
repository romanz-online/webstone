import FontFaceObserver from 'fontfaceobserver'
import * as THREE from 'three'
import BoardView from './BoardView.ts'
import HandView from './HandView.ts'
import MinionBoardView from './MinionBoardView.ts'
import MinionCardView from './MinionCardView.ts'
import MinionModel from './MinionModel.ts'
import TargetingArrowSystem from './TargetingArrowSystem.ts'

enum Layer {
  GAMEPLAY_AREA = 0,
  TRAY = -0.1,
  MINION = -0.3,
  HERO = -0.4,
  MINIONS = -0.5,
}

class GameRenderer {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private sceneRoot: THREE.Object3D
  private gameplayArea: THREE.Mesh
  private playerBoard: BoardView
  private hand: HandView
  private targetingSystem: TargetingArrowSystem
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2

  private readonly ORTHO_SIZE = 4

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

    this.scene = new THREE.Scene()
    this.sceneRoot = new THREE.Object3D()
    this.sceneRoot.name = 'sceneRoot'
    this.scene.add(this.sceneRoot)

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.setupCamera()
    this.updateViewport()
    this.setupEventListeners()
  }

  public async initialize(): Promise<void> {
    await new FontFaceObserver('Belwe').load()

    this.createLighting()
    this.createGameplayArea()

    this.targetingSystem = new TargetingArrowSystem(this.scene)

    this.hand = new HandView(this.scene)
    this.hand.mesh.position.z = Layer.MINIONS
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))

    this.playerBoard = new BoardView(this.scene)
    this.playerBoard.mesh.position.z = Layer.MINIONS
    this.playerBoard.addMinion(
      new MinionBoardView(this.scene, new MinionModel({}))
    )
    this.playerBoard.addMinion(
      new MinionBoardView(this.scene, new MinionModel({}))
    )
    this.playerBoard.addMinion(
      new MinionBoardView(this.scene, new MinionModel({}))
    )
    // this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))
    // this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))

    this.startRenderLoop()
  }

  private setupCamera(): void {
    this.camera = new THREE.OrthographicCamera(
      0, // left - start at 0
      1920, // right - full width
      1080, // top - full height
      0, // bottom - start at 0
      0.1,
      100
    )

    this.camera.position.set(960, 540, 50) // Center camera
    this.camera.lookAt(960, 540, 0)
  }

  private updateViewport(): void {
    const aspect = 1920 / 1080
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
        const geometry = new THREE.PlaneGeometry(
          texture.image.width,
          texture.image.height
        )

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
        })

        this.gameplayArea = new THREE.Mesh(geometry, material)
        this.gameplayArea.position.set(
          texture.image.width,
          texture.image.height,
          0
        )
        this.sceneRoot.add(this.gameplayArea)
      }
    )
  }

  private updateMousePosition(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  private raycastFromMouse(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    return this.raycaster.intersectObjects(this.scene.children, true)
  }

  private getWorldPositionOnPlane(z: number = -3): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), z)
    const target = new THREE.Vector3()
    const intersection = this.raycaster.ray.intersectPlane(plane, target)
    return intersection
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.updateViewport()
    })

    this.canvas.addEventListener('mousedown', (event) => {
      this.updateMousePosition(event)
      const intersects = this.raycastFromMouse()

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh
        if (mesh.userData && mesh.userData.owner) {
          if (mesh.userData.owner instanceof MinionCardView) {
            const card = mesh.userData.owner
            const worldPos = this.getWorldPositionOnPlane()
            if (worldPos) {
              card.dragOffset = card.mesh.position.clone().sub(worldPos)
            }
            MinionCardView.draggedCard = card
          } else if (mesh.userData.owner instanceof MinionBoardView) {
            this.targetingSystem.startTargeting(mesh.userData.owner)
          }
        }
      }
    })

    this.canvas.addEventListener('mousemove', (event) => {
      this.updateMousePosition(event)

      if (MinionCardView.draggedCard) {
        const worldPos = this.getWorldPositionOnPlane()
        if (worldPos) {
          const targetPos = worldPos
            .clone()
            .add(MinionCardView.draggedCard.dragOffset)
          MinionCardView.draggedCard.mesh.position.lerp(targetPos, 0.7)

          if (
            this.isIntersecting(
              MinionCardView.draggedCard.getBoundingInfo(),
              this.playerBoard.getBoundingInfo()
            )
          ) {
            this.playerBoard.updatePlaceholderPosition(
              MinionCardView.draggedCard.mesh.position.x
            )
          } else {
            this.playerBoard.removePlaceholder()
          }
        }
      } else if (this.targetingSystem.isActive) {
        const worldPos = this.getWorldPositionOnPlane()
        if (worldPos) {
          this.targetingSystem.updateTargetingPosition(worldPos)
        }
      }
    })

    this.canvas.addEventListener('mouseup', (event) => {
      this.updateMousePosition(event)

      if (MinionCardView.draggedCard) {
        if (
          this.isIntersecting(
            MinionCardView.draggedCard.getBoundingInfo(),
            this.playerBoard.getBoundingInfo()
          )
        ) {
          console.log('Card was dropped on board')
          this.hand.removeCard(MinionCardView.draggedCard)
          // triggerEvent playCard

          // triggered by event summonMinion
          this.playerBoard.summonMinion(
            new MinionBoardView(this.scene, new MinionModel({})),
            this.playerBoard.placeholderIndex
          )
        } else {
          MinionCardView.draggedCard.revert()
        }
        MinionCardView.draggedCard.dragOffset = null
        MinionCardView.draggedCard = null
      } else if (this.targetingSystem.isActive) {
        const intersects = this.raycastFromMouse()

        if (intersects.length > 0) {
          const mesh = intersects[0].object as THREE.Mesh
          if (mesh.userData && mesh.userData.owner instanceof MinionBoardView) {
            const targetMinion = mesh.userData.owner

            console.log(
              'Attack from',
              this.targetingSystem.sourceMinion,
              'to',
              targetMinion
            )
          }
        }

        this.targetingSystem.endTargeting()
      }
    })
  }

  private isIntersecting(
    item1: { min: THREE.Vector3; max: THREE.Vector3 },
    item2: { min: THREE.Vector3; max: THREE.Vector3 }
  ): boolean {
    return (
      item1.min.x < item2.max.x &&
      item1.max.x > item2.min.x &&
      item1.min.y < item2.max.y &&
      item1.max.y > item2.min.y
    )
  }

  private startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate)
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }
}

;(async () => {
  const gameRenderer = new GameRenderer('main')
  await gameRenderer.initialize()
})()

// const triggerWsEvent = (event: EventType, data: any = {}): void => {
//   if (ws) {
//     ws.send(JSON.stringify({ event: event, data: data }))
//   } else {
//     console.error('! WebSocket not defined')
//   }
// }

// let ws: WebSocket

//   console.log('Connecting WebSocket...')
//   ws = new WebSocket('ws://localhost:5500')
//   ws.onopen = () => {
//     console.log('Connected to WebSocket server')

//     console.log('Setting up WebSocket listeners...')
//     wsEventHandler({
//       socket: ws,
//       event: EventType.Load,
//       onSuccess: (data: any) => {
//         data.player1.hand.forEach((card) => {
//           const model = new MinionModel(card),
//             cardView = new MinionCardView(model),
//             boardView = new MinionBoardView(model)
//           minionModels.push(model)
//           minionCardViews.push(cardView)
//           minionBoardViews.push(boardView)
//         })
//         hand.setHandData(minionCardViews)
//         board.setBoardData(minionBoardViews)
//       },
//       onFailure: (data: any) => {
//         setTimeout(() => {
//           triggerWsEvent(EventType.TryLoad) // retry
//         }, 5 * 1000)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.PlayCard,
//       onSuccess: (data: any) => {
//         hand.playCard(data.cardID)
//       },
//     })

//     wsEventHandler({
//       socket: ws,
//       event: EventType.SummonMinion,
//       onSuccess: (data: any) => {
//         // board.summonMinion(data.minionID, data.boardIndex)
//       },
//     })

//     console.log('Loading game state...')
//     triggerWsEvent(EventType.TryLoad)
//   }
//   ws.onclose = () => {
//     console.log('Disconnected from WebSocket server')
//   }
// })()
