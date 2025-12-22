import * as THREE from 'three'
import { EventType } from './constants.ts'
import { Cursor } from './gameConstants.ts'
import GameStateManager from './GameStateManager.ts'
import InteractionManager from './InteractionManager.ts'
import MinionCard from './MinionCard.ts'
import { NetworkManager, networkConnectedEvent } from './NetworkManager.ts'
import OpponentMinionBoard from './OpponentMinionBoard.ts'
import OpponentPortrait from './OpponentPortrait.ts'
import PlayerMinionBoard from './PlayerMinionBoard.ts'
import PlayerPortrait from './PlayerPortrait.ts'
import SceneManager from './SceneManager.ts'
import TargetingArrowSystem from './TargetingArrowSystem.ts'

class GameRenderer {
  private sceneManager: SceneManager
  private gameStateManager: GameStateManager
  private networkManager: NetworkManager
  private interactionManager: InteractionManager
  private targetingArrowSystem: TargetingArrowSystem
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private isTargeting: boolean = false
  private targetingSource: PlayerMinionBoard | PlayerPortrait | null = null

  constructor(canvasId: string) {
    this.sceneManager = new SceneManager(canvasId)
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
  }

  public async initialize(): Promise<void> {
    await this.sceneManager.initialize()

    // Initialize managers
    this.gameStateManager = new GameStateManager(this.sceneManager.getScene())
    this.gameStateManager.initialize()

    this.networkManager = new NetworkManager('ws://localhost:5500')

    // Initialize interaction manager and targeting system
    this.interactionManager = new InteractionManager(
      this.sceneManager.getCamera(),
      this.sceneManager.getRenderer()
    )
    this.targetingArrowSystem = new TargetingArrowSystem(
      this.sceneManager.getScene()
    )

    // Set up event wiring between managers
    this.setupEventWiring()
    this.setupMouseEventListeners()

    // Connect to server
    await this.networkManager.connect()

    // Start render loop
    this.startRenderLoop()
  }

  private setupEventWiring(): void {
    // Register player board as drop zone
    this.interactionManager.addDropZone(this.gameStateManager.getPlayerBoard())

    // Set up interaction event listeners for drop feedback
    this.interactionManager.addEventListener('hoverdropzone', (event: any) => {
      const { dropZone, draggable, worldPosition } = event.detail

      if (
        draggable instanceof MinionCard &&
        dropZone === this.gameStateManager.getPlayerBoard()
      ) {
        this.gameStateManager
          .getPlayerBoard()
          .updatePlaceholderPosition(worldPosition.x, worldPosition.y)
      }
    })

    this.interactionManager.addEventListener('leavedropzone', (event: any) => {
      const { dropZone, draggable } = event.detail

      if (
        draggable instanceof MinionCard &&
        dropZone === this.gameStateManager.getPlayerBoard()
      ) {
        this.gameStateManager.getPlayerBoard().removePlaceholder()
      }
    })

    this.interactionManager.addEventListener('dragend', (event: any) => {
      const dragEvent = event.detail
      const draggable = dragEvent.object.userData.owner

      if (draggable instanceof MinionCard) {
        if (
          !this.isIntersecting(
            draggable.getBoundingInfo(),
            this.gameStateManager.getPlayerBoard().getBoundingInfo()
          )
        ) {
          draggable.revert()
        }
      }
    })

    // Network event handlers
    this.networkManager.addEventListener(networkConnectedEvent, () => {
      console.log('Loading game state...')
      this.networkManager.sendEvent(EventType.TryLoad)
    })

    this.networkManager.registerHandler(
      EventType.Load,
      (data: any) => this.gameStateManager.loadServerGameState(data),
      (data: any) =>
        setTimeout(() => {
          this.networkManager.sendEvent(EventType.TryLoad)
        }, 2000)
    )

    this.networkManager.registerHandler(
      EventType.PlayCard,
      (data: any) => this.gameStateManager.playCard(data, true),
      (data: any) => this.gameStateManager.playCard(data, false)
    )

    this.networkManager.registerHandler(EventType.SummonMinion, (data: any) =>
      this.gameStateManager.summonMinion(data)
    )

    this.networkManager.registerHandler(EventType.Attack, (data: any) =>
      this.gameStateManager.handleAttackEvent(data)
    )

    this.networkManager.registerHandler(EventType.Damage, (data: any) =>
      this.gameStateManager.handleDamageEvent(data)
    )

    // GameState events
    this.gameStateManager.addEventListener('stateloaded', (event: any) => {
      const { cards } = event.detail
      cards.forEach((card: MinionCard) => {
        this.interactionManager.addDraggableObject(card.mesh)
        this.interactionManager.addHoverableObject(card.mesh)
      })
    })

    this.gameStateManager.addEventListener('cardplayed', (event: any) => {
      const { card } = event.detail
      this.interactionManager.removeDraggableObject(card.mesh)
      this.interactionManager.removeHoverableObject(card.mesh)
    })

    // PlayerBoard → Network
    this.gameStateManager
      .getPlayerBoard()
      .addEventListener('playcard', (event: any) => {
        const { cardType, boardIndex, minionID, playerID } = event.detail
        this.networkManager.sendEvent(EventType.TryPlayCard, {
          cardType,
          boardIndex,
          minionID,
          playerID,
        })
      })
  }

  private updateMousePosition(event: MouseEvent): void {
    const canvas = this.sceneManager.getRenderer().domElement
    const rect = canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  private raycastFromMouse(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.getCamera())
    return this.raycaster.intersectObjects(
      this.sceneManager.getScene().children,
      true
    )
  }

  private getWorldPositionOnPlane(z: number = -3): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.mouse, this.sceneManager.getCamera())
    return this.raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 0, 1), z),
      new THREE.Vector3()
    )
  }

  private setupMouseEventListeners(): void {
    const canvas = this.sceneManager.getRenderer().domElement
    canvas.addEventListener('mousedown', (event) => {
      this.updateMousePosition(event)

      // Check if clicking on a board minion or player portrait
      const intersections = this.raycastFromMouse()
      for (const intersection of intersections) {
        const object = intersection.object
        if (
          object.userData?.owner instanceof PlayerMinionBoard ||
          object.userData?.owner instanceof PlayerPortrait
        ) {
          // Start targeting from this minion or player portrait
          this.isTargeting = true
          this.targetingSource = object.userData.owner
          this.targetingArrowSystem.startTargeting(this.targetingSource)
          canvas.style.cursor = Cursor.HIDDEN
          break
        }
      }
    })

    canvas.addEventListener('mousemove', (event) => {
      this.updateMousePosition(event)

      // Update targeting arrow position if active
      if (this.isTargeting && this.targetingArrowSystem.isActive) {
        const cursorPosition = this.getWorldPositionOnPlane(0)
        if (cursorPosition) {
          this.targetingArrowSystem.updateTargetingPosition(cursorPosition)
        }
      }
    })

    canvas.addEventListener('mouseup', (event) => {
      if (!this.isTargeting) return

      for (const intersection of this.raycastFromMouse()) {
        const owner = intersection.object.userData?.owner
        if (
          owner instanceof OpponentMinionBoard ||
          owner instanceof OpponentPortrait
        ) {
          // Extract attacker ID based on source type
          let attackerID: number
          if (this.targetingSource instanceof PlayerPortrait) {
            attackerID = this.targetingSource.hero.id
          } else if (this.targetingSource instanceof PlayerMinionBoard) {
            attackerID = this.targetingSource.minion.id
          } else {
            break
          }

          // Extract target ID based on owner type
          let targetID: number
          if (owner instanceof OpponentPortrait) {
            targetID = owner.hero.id
          } else if (owner instanceof OpponentMinionBoard) {
            targetID = owner.minion.id
          } else {
            break
          }

          // Trigger attack event
          this.networkManager.sendEvent(EventType.TryAttack, {
            attackerID,
            targetID,
          })
          break
        }
      }

      // Cleanup targeting state
      this.targetingArrowSystem.endTargeting()
      this.isTargeting = false
      this.targetingSource = null
      canvas.style.cursor = Cursor.DEFAULT
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

      // Use InteractionManager for hover detection
      this.interactionManager.updateHoverState(this.raycastFromMouse())

      this.sceneManager.render()
    }
    animate()
  }
}

;(async () => await new GameRenderer('main').initialize())()
