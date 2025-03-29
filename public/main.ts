import * as BABYLON from 'babylonjs'
import FontFaceObserver from 'fontfaceobserver'
import BoardView from './BoardView.ts'
import HandView from './HandView.ts'
import MinionBoardView from './MinionBoardView.ts'
import MinionCardView from './MinionCardView.ts'
import MinionModel from './MinionModel.ts'

enum Layer {
  GAMEPLAY_AREA = 0,
  TRAY = -0.1,
  CORNER = -0.2,
  MINION = -0.3,
  HERO = -0.4,
  HAND = -0.5,
}

interface CornerConfig {
  name: string
  texturePath: string
  anchorX: number
  anchorZ: number
}

class GameRenderer {
  private canvas: HTMLCanvasElement
  private engine: BABYLON.Engine
  private scene: BABYLON.Scene
  private camera: BABYLON.FreeCamera
  private sceneRoot: BABYLON.TransformNode
  private gameplayArea: BABYLON.GroundMesh
  private board: BoardView
  private hand: HandView

  private readonly ORTHO_SIZE = 4
  private readonly CORNER_SIZE = 3

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    this.engine = new BABYLON.Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.scene = new BABYLON.Scene(this.engine)
    this.sceneRoot = new BABYLON.TransformNode('sceneRoot', this.scene)

    this.setupCamera()
    this.setupEventListeners()
  }

  public async initialize(): Promise<void> {
    await new FontFaceObserver('Belwe').load()

    this.createLighting()
    this.createGameplayArea()

    this.hand = new HandView(this.scene)
    this.hand.mesh.position.z = Layer.HAND
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))
    this.hand.addCard(new MinionCardView(this.scene, new MinionModel({})))

    this.board = new BoardView(this.scene)
    this.board.mesh.position.z = Layer.HAND
    this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))
    this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))
    this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))
    // this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))
    // this.board.addMinion(new MinionBoardView(this.scene, new MinionModel({})))

    this.startRenderLoop()
  }

  private setupCamera(): void {
    this.camera = new BABYLON.FreeCamera(
      'camera',
      new BABYLON.Vector3(0, 0, -100),
      this.scene
    )

    this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA
    this.camera.setTarget(new BABYLON.Vector3(0, 0, 0))

    const aspect = this.canvas.width / this.canvas.height
    this.camera.orthoTop = this.ORTHO_SIZE
    this.camera.orthoBottom = -this.ORTHO_SIZE
    this.camera.orthoLeft = -this.ORTHO_SIZE * aspect
    this.camera.orthoRight = this.ORTHO_SIZE * aspect
    this.camera.detachControl()
  }

  private createLighting(): void {
    new BABYLON.HemisphericLight(
      'light',
      new BABYLON.Vector3(0, 0, -10),
      this.scene
    )

    // const light = new BABYLON.DirectionalLight(
    //   'mainLight',
    //   new BABYLON.Vector3(-1, -2, -1),
    //   this.scene
    // )
    // light.intensity = 0.7

    // // Configure shadow generator
    // const shadowGenerator = new BABYLON.ShadowGenerator(1024, light)
    // shadowGenerator.useBlurExponentialShadowMap = true
    // shadowGenerator.blurScale = 2
    // shadowGenerator.setDarkness(0.3)
  }

  private createGameplayArea(): void {
    const texture = new BABYLON.Texture(
      './media/images/maps/Default/GameplayArea_transparent.png',
      this.scene,
      undefined,
      undefined,
      undefined,
      () => {
        texture.hasAlpha = true

        const screenHeight = this.camera.orthoTop - this.camera.orthoBottom
        this.gameplayArea = BABYLON.MeshBuilder.CreateGround(
          'gameplayArea',
          {
            width: screenHeight,
            height: screenHeight / 2,
            subdivisions: 2,
            updatable: false,
          },
          this.scene
        )

        const material = new BABYLON.StandardMaterial('groundMat', this.scene)
        material.specularColor = new BABYLON.Color3(0, 0, 0)
        material.diffuseTexture = texture
        material.useAlphaFromDiffuseTexture = true
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND

        this.gameplayArea.material = material
        this.gameplayArea.parent = this.sceneRoot
        this.gameplayArea.position = this.sceneRoot.position.clone()
        this.gameplayArea.lookAt(new BABYLON.Vector3(0, Math.PI, 1))
        this.gameplayArea.position.z = Layer.GAMEPLAY_AREA

        // this.createCorners()
        this.createHeroTrays()
      }
    )
  }

  private createCorners(): void {
    const cornerConfigs: CornerConfig[] = [
      {
        name: 'corner1',
        texturePath: './media/images/maps/Default/TL_transparent.png',
        anchorX: -1,
        anchorZ: 1,
      },
      {
        name: 'corner2',
        texturePath: './media/images/maps/Default/TR_transparent.png',
        anchorX: 1,
        anchorZ: 1,
      },
      {
        name: 'corner3',
        texturePath: './media/images/maps/Default/BL_transparent.png',
        anchorX: -1,
        anchorZ: -1,
      },
      {
        name: 'corner4',
        texturePath: './media/images/maps/Default/BR_transparent.png',
        anchorX: 1,
        anchorZ: -1,
      },
    ]

    cornerConfigs.forEach((config) => this.createCorner(config))
  }

  private createCorner(config: CornerConfig): void {
    // const material = createTransparentMaterialWithTexture(
    //   this.scene,
    //   `${config.name}Mat`,
    //   config.texturePath
    // )
    // const corner = BABYLON.MeshBuilder.CreateGround(
    //   config.name,
    //   { width: this.CORNER_SIZE, height: this.CORNER_SIZE },
    //   this.scene
    // )
    // corner.material = material
    // corner.position.x =
    //   this.gameplayArea.position.x +
    //   config.anchorX * this.gameplayArea._width * 1.5
    // corner.position.z =
    //   this.gameplayArea.position.z +
    //   config.anchorZ * this.gameplayArea._height * 3
    // corner.position.y = 3
    // // Apply position adjustments based on corner position
    // this.adjustCornerPosition(corner, config.anchorX, config.anchorZ)
    // corner.parent = this.sceneRoot
  }

  private adjustCornerPosition(
    corner: BABYLON.Mesh,
    anchorX: number,
    anchorZ: number
  ): void {
    if (anchorX === -1 && anchorZ === 1) {
      // Top-left
      corner.position.x += 0.07
      corner.position.z -= 0.9
    } else if (anchorX === 1 && anchorZ === 1) {
      // Top-right
      corner.position.x += 0.07
      corner.position.z -= 0.7
    } else if (anchorX === -1 && anchorZ === -1) {
      // Bottom-left
      // No adjustment needed
    } else if (anchorX === 1 && anchorZ === -1) {
      // Bottom-right
      corner.position.x += 0.17
      corner.position.z += 0.25
    }
  }

  private createHeroTrays(): void {
    const topTexture = new BABYLON.Texture(
      './media/images/maps/Default/HeroTrays_transparent.png',
      this.scene,
      undefined,
      undefined,
      undefined,
      () => {
        topTexture.hasAlpha = true
        topTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE
        topTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE
        topTexture.vScale = 0.5
        topTexture.vOffset = 0.5

        const material = new BABYLON.StandardMaterial(
          'topTrayMaterial',
          this.scene
        )
        material.diffuseTexture = topTexture
        material.diffuseTexture.hasAlpha = true
        material.useAlphaFromDiffuseTexture = true
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND
        material.specularColor = new BABYLON.Color3(0, 0, 0)

        const trayMesh = BABYLON.MeshBuilder.CreatePlane(
          'topTrayMesh',
          { width: 5, height: 2.5 },
          this.scene
        )
        trayMesh.material = material
        trayMesh.position.x = this.gameplayArea.position.x
        trayMesh.position.y = 2 + 0.3
        trayMesh.position.z = Layer.TRAY
        trayMesh.parent = this.sceneRoot
      }
    )

    const bottomTexture = new BABYLON.Texture(
      './media/images/maps/Default/HeroTrays_transparent.png',
      this.scene,
      undefined,
      undefined,
      undefined,
      () => {
        bottomTexture.hasAlpha = true
        bottomTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE
        bottomTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE
        bottomTexture.vScale = 0.5
        bottomTexture.vOffset = 0

        const material = new BABYLON.StandardMaterial(
          'bottomTrayMaterial',
          this.scene
        )
        material.diffuseTexture = bottomTexture
        material.diffuseTexture.hasAlpha = true
        material.useAlphaFromDiffuseTexture = true
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND
        material.specularColor = new BABYLON.Color3(0, 0, 0)

        const trayMesh = BABYLON.MeshBuilder.CreatePlane(
          'bottomTrayMesh',
          { width: 5, height: 2.5 },
          this.scene
        )
        trayMesh.material = material
        trayMesh.position.x = this.gameplayArea.position.x
        trayMesh.position.y = -2 - 0.3
        trayMesh.position.z = Layer.TRAY
        trayMesh.parent = this.sceneRoot
      }
    )

    // const
    //   bottomHeroTrayMaterial = this.createHalfTextureMaterial(
    //     'bottomHeroTray',
    //     './media/images/maps/Default/HeroTrays_transparent.png',
    //     false
    //   )
    // const bottomHeroTray = BABYLON.MeshBuilder.CreateGround(
    //   'bottomHeroTrayMesh',
    //   { width: 5, height: 2.5 },
    //   this.scene
    // )
    // bottomHeroTray.material = bottomHeroTrayMaterial
    // bottomHeroTray.position.x = this.gameplayArea.position.x - 0.04
    // bottomHeroTray.position.z =
    //   this.gameplayArea.position.z - topHeroTray._height - 0.1
    // bottomHeroTray.position.y = 0
    // bottomHeroTray.parent = this.sceneRoot
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight

      setTimeout(() => {
        const aspect = this.canvas.width / this.canvas.height
        this.camera.orthoLeft = -this.ORTHO_SIZE * aspect
        this.camera.orthoRight = this.ORTHO_SIZE * aspect
        this.engine.resize()
      }, 50)
    })

    this.scene.onPointerDown = (evt, pickInfo) => {
      if (pickInfo.hit && pickInfo.pickedMesh) {
        const mesh = pickInfo.pickedMesh
        // console.log(mesh.name, mesh.metadata)
        if (mesh.metadata && mesh.metadata.owner) {
          const card = mesh.metadata.owner
          const ray = this.scene.createPickingRay(
            this.scene.pointerX,
            this.scene.pointerY,
            BABYLON.Matrix.Identity(),
            this.camera
          )

          const distance = ray.intersectsPlane(new BABYLON.Plane(0, 0, 1, -3))
          if (distance !== null) {
            const hitPoint = ray.origin.add(ray.direction.scale(distance))
            card.dragOffset = card.mesh.position.subtract(hitPoint)
          }
          MinionCardView.draggedCard = card
        }
      }
    }

    this.scene.onPointerMove = () => {
      if (!MinionCardView.draggedCard) return

      const ray = this.scene.createPickingRay(
        this.scene.pointerX,
        this.scene.pointerY,
        BABYLON.Matrix.Identity(),
        this.camera
      )

      const distance = ray.intersectsPlane(new BABYLON.Plane(0, 0, 1, -3))
      if (distance) {
        MinionCardView.draggedCard.mesh.position = BABYLON.Vector3.Lerp(
          ray.origin
            .add(ray.direction.scale(distance))
            .add(MinionCardView.draggedCard.dragOffset),
          MinionCardView.draggedCard.mesh.position.clone(),
          0.3
        )

        if (
          this.isIntersecting(
            MinionCardView.draggedCard.getBoundingInfo(),
            this.board.getBoundingInfo()
          )
        ) {
          const draggedCardWorldMatrix =
              MinionCardView.draggedCard.mesh.getWorldMatrix(),
            draggedCardPosition = BABYLON.Vector3.TransformCoordinates(
              MinionCardView.draggedCard.mesh.position,
              draggedCardWorldMatrix
            )

          this.board.updatePlaceholderPosition(draggedCardPosition.x)
        } else {
          this.board.removePlaceholder()
        }
      }
    }

    this.scene.onPointerUp = () => {
      if (MinionCardView.draggedCard) {
        if (
          this.isIntersecting(
            MinionCardView.draggedCard.getBoundingInfo(),
            this.board.getBoundingInfo()
          )
        ) {
          console.log('Card was dropped on board')
          this.hand.removeCard(MinionCardView.draggedCard)
          // triggerEvent playCard

          // triggered by event summonMinion
          this.board.summonMinion(
            new MinionBoardView(this.scene, new MinionModel({})),
            this.board.placeholderIndex
          )
        } else {
          MinionCardView.draggedCard.revert()
        }
        MinionCardView.draggedCard.dragOffset = null
        MinionCardView.draggedCard = null
      }
    }
  }

  private isIntersecting(
    item1: BABYLON.BoundingInfo,
    item2: BABYLON.BoundingInfo
  ): boolean {
    return (
      item1.boundingBox.minimumWorld.x < item2.boundingBox.maximumWorld.x &&
      item1.boundingBox.maximumWorld.x > item2.boundingBox.minimumWorld.x &&
      item1.boundingBox.minimumWorld.y < item2.boundingBox.maximumWorld.y &&
      item1.boundingBox.maximumWorld.y > item2.boundingBox.minimumWorld.y
    )
  }

  private startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
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
