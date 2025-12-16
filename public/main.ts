import FontFaceObserver from 'fontfaceobserver'
import * as THREE from 'three'
import { EventType } from './constants.ts'
import { Layer } from './gameConstants.ts'
import InteractionManager from './InteractionManager.ts'
import MinionBoard from './MinionBoard.ts'
import MinionCard from './MinionCard.ts'
import MinionModel from './MinionModel.ts'
import OpponentBoard from './OpponentBoard.ts'
import OpponentPortrait from './OpponentPortrait.ts'
import PlayerBoard from './PlayerBoard.ts'
import PlayerHand from './PlayerHand.ts'
import PlayerPortrait from './PlayerPortrait.ts'
import TargetingArrowSystem from './TargetingArrowSystem.ts'
import { setWebSocket, triggerWsEvent, wsEventHandler } from './ws.ts'

// Logical game dimensions (16:9 ratio)
const GAME_WIDTH = 16
const GAME_HEIGHT = 9

class GameRenderer {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private sceneRoot: THREE.Object3D
  private gameplayArea: THREE.Mesh
  private playerBoard: PlayerBoard
  private opponentBoard: OpponentBoard
  private playerPortrait: PlayerPortrait
  private opponentPortrait: OpponentPortrait
  private playerHand: PlayerHand
  private interactionManager: InteractionManager
  private targetingArrowSystem: TargetingArrowSystem
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private isTargeting: boolean = false
  private targetingSource: MinionBoard | PlayerPortrait | null = null

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

    // Initialize interaction manager and targeting system
    this.interactionManager = new InteractionManager(this.camera, this.renderer)
    this.targetingArrowSystem = new TargetingArrowSystem(this.scene)

    this.playerPortrait = new PlayerPortrait(this.scene)
    this.opponentPortrait = new OpponentPortrait(this.scene)

    this.playerHand = new PlayerHand(this.scene)
    this.playerHand.mesh.position.z = Layer.HAND

    this.playerBoard = new PlayerBoard(this.scene)
    this.playerBoard.mesh.position.z = Layer.HAND

    this.opponentBoard = new OpponentBoard(this.scene)
    this.opponentBoard.mesh.position.z = Layer.HAND

    // Register the board as a drop zone
    this.interactionManager.addDropZone(this.playerBoard)

    // Set up interaction event listeners
    this.setupInteractionEventListeners()
    this.setupMouseEventListeners()

    this.startRenderLoop()
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)

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
        const geometry = new THREE.PlaneGeometry(GAME_WIDTH, GAME_HEIGHT)

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.1,
        })

        this.gameplayArea = new THREE.Mesh(geometry, material)
        this.gameplayArea.position.set(0, 0, 0)
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
    return this.raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 0, 1), z),
      new THREE.Vector3()
    )
  }

  private setupInteractionEventListeners(): void {
    // Listen for hover over drop zones
    this.interactionManager.addEventListener('hoverdropzone', (event: any) => {
      const { dropZone, draggable, worldPosition } = event.detail

      if (draggable instanceof MinionCard && dropZone === this.playerBoard) {
        this.playerBoard.updatePlaceholderPosition(
          worldPosition.x,
          worldPosition.y
        )
      }
    })

    // Listen for leaving drop zones
    this.interactionManager.addEventListener('leavedropzone', (event: any) => {
      const { dropZone, draggable } = event.detail

      if (draggable instanceof MinionCard && dropZone === this.playerBoard) {
        this.playerBoard.removePlaceholder()
      }
    })

    // Listen for successful drops to remove cards from hand
    this.interactionManager.addEventListener('dragend', (event: any) => {
      const dragEvent = event.detail
      const draggable = dragEvent.object.userData.owner

      if (draggable instanceof MinionCard) {
        // Check if the card was successfully dropped on board
        if (
          !this.isIntersecting(
            draggable.getBoundingInfo(),
            this.playerBoard.getBoundingInfo()
          )
        ) {
          // Revert card position if not dropped on valid zone
          draggable.revert()
        }
        // Card removal now handled by WebSocket event handler after server confirmation
        this.playerBoard.removePlaceholder()
      }
    })
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.updateViewport()
    })
  }

  private setupMouseEventListeners(): void {
    this.canvas.addEventListener('mousedown', (event) => {
      this.updateMousePosition(event)

      // Check if clicking on a board minion or player portrait
      const intersections = this.raycastFromMouse()
      for (const intersection of intersections) {
        const object = intersection.object
        if (
          object.userData?.owner instanceof MinionBoard ||
          object.userData?.owner instanceof PlayerPortrait
        ) {
          // Start targeting from this minion or player portrait
          this.isTargeting = true
          this.targetingSource = object.userData.owner
          this.targetingArrowSystem.startTargeting(this.targetingSource)
          break
        }
      }
    })

    this.canvas.addEventListener('mousemove', (event) => {
      this.updateMousePosition(event)

      // Update targeting arrow position if active
      if (this.isTargeting && this.targetingArrowSystem.isActive) {
        const cursorPosition = this.getWorldPositionOnPlane(0)
        if (cursorPosition) {
          this.targetingArrowSystem.updateTargetingPosition(cursorPosition)
        }
      }
    })

    this.canvas.addEventListener('mouseup', (event) => {
      // End targeting if active
      if (this.isTargeting) {
        this.targetingArrowSystem.endTargeting()
        this.isTargeting = false
        this.targetingSource = null
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

  loadServerGameState(data: any, success: boolean): void {
    const minionCardViews: MinionCard[] = []
    const playerBoardViews: MinionBoard[] = []
    const opponentBoardViews: MinionBoard[] = []

    data.player1.hand.forEach((card) => {
      const model = new MinionModel(card)
      const cardView = new MinionCard(this.scene, model)
      minionCardViews.push(cardView)
      this.interactionManager.addDraggableObject(cardView.mesh)
    })

    data.player1.board.forEach((minionData) => {
      const model = new MinionModel(minionData)
      const boardView = new MinionBoard(this.scene, model)
      playerBoardViews.push(boardView)
    })

    if (data.player2 && data.player2.board) {
      data.player2.board.forEach((minionData) => {
        const model = new MinionModel(minionData)
        const boardView = new MinionBoard(this.scene, model)
        opponentBoardViews.push(boardView)
      })
    }

    this.playerHand.setHandData(minionCardViews)
    this.playerBoard.setBoardData(playerBoardViews)
    this.opponentBoard.setBoardData(opponentBoardViews)
  }

  summonMinion(data: any, success: boolean): void {
    const model = new MinionModel(data.minionData)
    const boardView = new MinionBoard(this.scene, model)
    this.playerBoard.summonMinion(boardView, data.boardIndex)
  }

  playCard(data: any, success: boolean): void {
    const card = this.playerHand.cards.find((c) => c.minion.id === data.cardID)
    if (success) {
      if (card) {
        this.interactionManager.removeDraggableObject(card.mesh)
        this.playerHand.removeCard(card)
      }
    } else if (card) {
      card.revert()
    }
  }
}

let gameRenderer: GameRenderer | null = null

;(async () => {
  gameRenderer = new GameRenderer('main')
  await gameRenderer.initialize()
})()

console.log('Connecting WebSocket...')
const ws = new WebSocket('ws://localhost:5500')
setWebSocket(ws)
ws.onopen = () => {
  console.log('Connected to WebSocket server')

  console.log('Setting up WebSocket listeners...')
  wsEventHandler({
    socket: ws,
    event: EventType.Load,
    onSuccess: (data: any) => {
      if (gameRenderer) {
        gameRenderer.loadServerGameState(data, true)
      }
    },
    onFailure: (data: any) => {
      setTimeout(() => {
        triggerWsEvent(EventType.TryLoad) // retry
      }, 2 * 1000)
    },
  })

  wsEventHandler({
    socket: ws,
    event: EventType.PlayCard,
    onSuccess: (data: any) => {
      if (gameRenderer) {
        gameRenderer.playCard(data, true)
      }
    },
    onFailure: (data: any) => {
      if (gameRenderer) {
        gameRenderer.playCard(data, false)
      }
    },
  })

  wsEventHandler({
    socket: ws,
    event: EventType.SummonMinion,
    onSuccess: (data: any) => {
      if (gameRenderer) {
        gameRenderer.summonMinion(data, true)
      }
    },
  })

  console.log('Loading game state...')
  triggerWsEvent(EventType.TryLoad)
}
ws.onclose = () => {
  console.log('Disconnected from WebSocket server')
}
