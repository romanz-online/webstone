import * as BABYLON from 'babylonjs'
import MinionModel from './MinionModel.ts'

enum Layer {
  PORTRAIT = 0,
  FRAME = -0.1,
  OVERLAY_ICONS = -0.2,
  OVERLAY_TEXT = -0.3,
  CLICKABLE_AREA = -0.4,
}

export default class MinionBoardView {
  public minion: MinionModel
  public mesh: BABYLON.TransformNode

  private scene: BABYLON.Scene
  private frame: BABYLON.Mesh
  private attackText: BABYLON.DynamicTexture
  private healthText: BABYLON.DynamicTexture

  constructor(
    scene: BABYLON.Scene,
    minion: MinionModel,
    position?: BABYLON.Vector3
  ) {
    this.scene = scene
    this.minion = minion

    this.mesh = new BABYLON.TransformNode('minionBoard', this.scene)
    if (position) {
      this.mesh.position = position
    }

    this.createCardMesh()
  }

  private createCardMesh(): void {
    const portraitTexture = new BABYLON.Texture(
      './media/images/cardimages/cairne_bloodhoof.jpg',
      this.scene,
      undefined,
      undefined,
      undefined,
      () => {
        portraitTexture.uOffset = 0.2
        portraitTexture.vOffset = 0.1
        const ratio =
          portraitTexture.getSize().height / portraitTexture.getSize().width

        const portrait = BABYLON.MeshBuilder.CreatePlane(
          'portrait',
          { width: 8, height: 8 * ratio },
          this.scene
        )
        portrait.parent = this.mesh
        portrait.position.y = 0
        portrait.position.z = Layer.PORTRAIT

        const material = new BABYLON.StandardMaterial(
          'portraitMaterial',
          this.scene
        )
        material.diffuseTexture = portraitTexture
        material.specularColor = new BABYLON.Color3(0, 0, 0)
        material.useAlphaFromDiffuseTexture = true
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND
        material.opacityTexture = this.createOvalMaskTexture()

        portrait.material = material
      },
      (message) => {
        console.log('Error loading texture:', message)
      }
    )

    const frameTexture = new BABYLON.Texture(
      './media/images/empty_minion_board_frame.png',
      this.scene,
      undefined,
      undefined,
      undefined,
      () => {
        frameTexture.hasAlpha = true

        const material = new BABYLON.StandardMaterial(
          'frameMaterial',
          this.scene
        )
        material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND
        material.specularColor = new BABYLON.Color3(0, 0, 0)
        material.diffuseColor = new BABYLON.Color3(1, 1, 1)
        material.useAlphaFromDiffuseTexture = true
        material.diffuseTexture = frameTexture
        material.backFaceCulling = false

        const ratio =
          frameTexture.getSize().height / frameTexture.getSize().width
        this.frame = BABYLON.MeshBuilder.CreatePlane(
          'frame',
          { width: 4, height: 4 * ratio },
          this.scene
        )
        this.frame.parent = this.mesh
        this.frame.position.z = Layer.FRAME
        this.frame.material = material
        // this.frame.material.alpha = 0.1

        const clickableAreaMesh = BABYLON.MeshBuilder.CreatePlane(
          'clickableArea',
          {
            width: this.frame.getBoundingInfo().boundingBox.extendSize.x * 2,
            height: this.frame.getBoundingInfo().boundingBox.extendSize.y * 2,
          },
          this.scene
        )
        clickableAreaMesh.parent = this.mesh
        clickableAreaMesh.position.z = Layer.CLICKABLE_AREA
        clickableAreaMesh.metadata = {
          owner: this,
        }

        const transparentMaterial = new BABYLON.StandardMaterial(
          'transparentMaterial',
          this.scene
        )
        transparentMaterial.alpha = 0
        clickableAreaMesh.material = transparentMaterial

        this.createOverlayElements()
      },
      (message) => {
        console.log('Error loading texture:', message)
      }
    )
  }

  private createOvalMaskTexture(): BABYLON.DynamicTexture {
    const size = 512
    const maskTexture = new BABYLON.DynamicTexture(
      'ovalMask',
      { width: size, height: size },
      this.scene,
      true
    )

    const context = maskTexture.getContext()

    context.clearRect(0, 0, size, size)
    context.fillStyle = 'rgba(0,0,0,0)'
    context.fillRect(0, 0, size, size)

    context.save()

    context.translate(size / 2, size / 2)
    context.scale(1, 1.7)

    context.beginPath()
    context.arc(0, 0, size * 0.225, 0, 2 * Math.PI)
    context.closePath()
    context.clip()

    const gradient = context.createRadialGradient(0, 0, size * 0.9, 0, 0, size)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    context.fillStyle = gradient
    context.fill()
    context.restore()

    maskTexture.update()
    return maskTexture
  }

  private async createOverlayElements(): Promise<void> {
    const statPlaneMaterial = new BABYLON.StandardMaterial(
      'statPlaneMaterial',
      this.scene
    )
    statPlaneMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND
    statPlaneMaterial.alpha = 0
    statPlaneMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
    statPlaneMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)

    const size = this.frame.getBoundingInfo().boundingBox.extendSize,
      sizeX = size.x,
      sizeY = size.y
    const statPlane = BABYLON.MeshBuilder.CreatePlane(
      'statPlane',
      {
        width: sizeX * 2,
        height: sizeY * 2,
      },
      this.scene
    )
    statPlane.parent = this.mesh
    statPlane.position = this.frame.position.clone()
    statPlane.position.z = Layer.OVERLAY_ICONS

    statPlane.material = statPlaneMaterial

    // Attack
    try {
      const mesh = await this.createOverlayIcon(
        './media/images/attack.png',
        statPlane,
        new BABYLON.Vector3(-sizeX + 0.8, -sizeY + 1.25, Layer.OVERLAY_ICONS)
      )
      this.setupAttack(mesh)
    } catch (error) {
      console.error('Failed to create attack icon:', error)
    }

    // Health
    try {
      const mesh = await this.createOverlayIcon(
        './media/images/health.png',
        statPlane,
        new BABYLON.Vector3(sizeX - 0.7, -sizeY + 1.25, Layer.OVERLAY_ICONS)
      )
      this.setupHealth(mesh)
    } catch (error) {
      console.error('Failed to create health icon:', error)
    }
  }

  private createOverlayIcon(
    texturePath: string,
    parentMesh: BABYLON.Mesh,
    position: BABYLON.Vector3
  ): Promise<BABYLON.Mesh> {
    return new Promise((resolve, reject) => {
      const texture = new BABYLON.Texture(
        texturePath,
        this.scene,
        undefined,
        undefined,
        undefined,
        () => {
          const material = new BABYLON.StandardMaterial(
            'overlayMaterial',
            this.scene
          )
          material.diffuseTexture = texture
          material.diffuseTexture.hasAlpha = true
          material.useAlphaFromDiffuseTexture = true
          material.specularColor = new BABYLON.Color3(0, 0, 0)
          material.backFaceCulling = false

          const iconMesh = BABYLON.MeshBuilder.CreatePlane(
            'overlayImage',
            { width: 1.45, height: 1.45 },
            this.scene
          )
          iconMesh.parent = parentMesh
          iconMesh.position = position
          iconMesh.material = material
          resolve(iconMesh)
        },
        () => {
          reject(new Error('Texture loading failed'))
        }
      )
    })
  }

  private setupAttack(parentMesh: BABYLON.Mesh): void {
    this.attackText = new BABYLON.DynamicTexture(
      'textTexture',
      256,
      this.scene,
      true
    )
    this.updateAttack(2)

    const textMaterial = new BABYLON.StandardMaterial(
      'textMaterial',
      this.scene
    )
    textMaterial.useAlphaFromDiffuseTexture = true
    textMaterial.diffuseTexture = this.attackText
    textMaterial.diffuseTexture.hasAlpha = true
    textMaterial.backFaceCulling = false

    const textPlane = BABYLON.MeshBuilder.CreatePlane(
      'attackText',
      {
        width: 1,
        height: 1,
      },
      this.scene
    )
    textPlane.parent = parentMesh
    textPlane.material = textMaterial
    textPlane.position.z = Layer.OVERLAY_TEXT
  }

  private setupHealth(parentMesh: BABYLON.Mesh): void {
    this.healthText = new BABYLON.DynamicTexture(
      'textTexture',
      256,
      this.scene,
      true
    )
    this.updateHealth(5)

    const textMaterial = new BABYLON.StandardMaterial(
      'textMaterial',
      this.scene
    )
    textMaterial.useAlphaFromDiffuseTexture = true
    textMaterial.diffuseTexture = this.healthText
    textMaterial.diffuseTexture.hasAlpha = true
    textMaterial.backFaceCulling = false

    const textPlane = BABYLON.MeshBuilder.CreatePlane(
      'healthText',
      {
        width: 1,
        height: 1,
      },
      this.scene
    )
    textPlane.parent = parentMesh
    textPlane.material = textMaterial
    textPlane.position.z = Layer.OVERLAY_TEXT
  }

  public setCardDepth(depth: number): void {
    this.mesh.position.z = depth
  }

  public transformToBoard(): void {
    this.mesh.scaling.set(0.25, 0.25, 1)
  }

  public updateAttack(newAttack: number): void {
    this.attackText.drawText(
      newAttack.toString(),
      80,
      250,
      'bold 300px Belwe',
      'white',
      null,
      true,
      true
    )
    this.attackText.update()
  }

  public updateHealth(newHealth: number): void {
    this.healthText.drawText(
      newHealth.toString(),
      50,
      250,
      'bold 300px Belwe',
      'white',
      null,
      true,
      true
    )
    this.healthText.update()
  }

  public dispose(): void {
    if (this.attackText) {
      this.attackText.dispose()
    }
    if (this.healthText) {
      this.healthText.dispose()
    }

    const disposeChildMeshes = (node: BABYLON.TransformNode) => {
      const children = node.getChildMeshes()
      children.forEach((child) => {
        if (child.material) {
          child.material.dispose()
        }

        if (child.getChildMeshes().length > 0) {
          disposeChildMeshes(child)
        }

        child.dispose()
      })
    }

    disposeChildMeshes(this.mesh)

    this.mesh.dispose()

    this.mesh = null
    this.frame = null
    this.attackText = null
    this.healthText = null
  }
}
