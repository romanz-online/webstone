import * as BABYLON from 'babylonjs'
import MinionModel from './MinionModel.ts'

enum Layer {
  PORTRAIT = 0,
  FRAME = -0.1,
  OVERLAY_ICONS = -0.2,
  OVERLAY_TEXT = -0.3,
  CLICKABLE_AREA = -0.4,
}

export default class MinionCardView {
  public static draggedCard: MinionCardView | null = null

  public minion: MinionModel
  public mesh: BABYLON.TransformNode
  public originalPosition: BABYLON.Vector3
  public dragOffset: BABYLON.Vector3 | null = null
  // public isEnlarged: boolean = false

  private scene: BABYLON.Scene
  private frame: BABYLON.Mesh
  private manaText: BABYLON.DynamicTexture
  private attackText: BABYLON.DynamicTexture
  private healthText: BABYLON.DynamicTexture

  constructor(
    scene: BABYLON.Scene,
    minion: MinionModel,
    position?: BABYLON.Vector3
  ) {
    this.scene = scene
    this.minion = minion

    this.mesh = new BABYLON.TransformNode('minionCard', this.scene)
    if (position) {
      this.mesh.position = position
    }

    this.originalPosition = this.mesh.position

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
          { width: 6, height: 6 * ratio },
          this.scene
        )
        portrait.parent = this.mesh
        portrait.position.y = 1.15
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
      './media/images/card_inhand_minion_priest_frame.png',
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

    // Mana
    try {
      const mesh = await this.createOverlayIcon(
        './media/images/mana.png',
        statPlane,
        new BABYLON.Vector3(-sizeX + 0.35, sizeY - 0.7, Layer.OVERLAY_ICONS)
      )
      this.setupMana(mesh)
    } catch (error) {
      console.error('Failed to create mana icon:', error)
    }

    // Attack
    try {
      const mesh = await this.createOverlayIcon(
        './media/images/attack.png',
        statPlane,
        new BABYLON.Vector3(-sizeX + 0.3, -sizeY + 0.4, Layer.OVERLAY_ICONS)
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
        new BABYLON.Vector3(sizeX - 0.3, -sizeY + 0.4, Layer.OVERLAY_ICONS)
      )
      this.setupHealth(mesh)
    } catch (error) {
      console.error('Failed to create health icon:', error)
    }

    // Name Banner
    try {
      const mesh = await this.createNameBannerImage(
        './media/images/name-banner-minion.png',
        statPlane,
        new BABYLON.Vector3(0, -0.3, Layer.OVERLAY_ICONS)
      )
      this.setupNameBanner(mesh)
    } catch (error) {
      console.error('Failed to create name banner:', error)
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
            {},
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

  private createNameBannerImage(
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

          const width =
            this.frame.getBoundingInfo().boundingBox.extendSize.x * 2 - 0.3
          const ratio = texture.getSize().height / texture.getSize().width
          const iconMesh = BABYLON.MeshBuilder.CreatePlane(
            'overlayImage',
            { width: width, height: width * ratio },
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

  private setupMana(parentMesh: BABYLON.Mesh): void {
    this.manaText = new BABYLON.DynamicTexture(
      'textTexture',
      256,
      this.scene,
      true
    )
    this.updateMana(4)

    const textMaterial = new BABYLON.StandardMaterial(
      'textMaterial',
      this.scene
    )
    textMaterial.useAlphaFromDiffuseTexture = true
    textMaterial.diffuseTexture = this.manaText
    textMaterial.diffuseTexture.hasAlpha = true
    textMaterial.backFaceCulling = false

    const textPlane = BABYLON.MeshBuilder.CreatePlane(
      'manaText',
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

  private setupNameBanner(parentMesh: BABYLON.Mesh): void {
    const textureSize = parentMesh.material.getActiveTextures()[0].getSize()
    const texture = new BABYLON.DynamicTexture(
      'textTexture',
      {
        width: textureSize.width,
        height: textureSize.height,
      },
      this.scene,
      true
    )

    const text = 'Cairne Bloodhoof'
    let fontSize = 200

    do {
      texture.clear()
      texture.drawText(
        text,
        textureSize.width / 2 - textureSize.width * 0.42,
        100,
        `bold ${fontSize}px Belwe`,
        'white',
        null,
        true,
        true
      )

      texture.update()
      const context = texture.getContext()
      context.font = `bold ${fontSize}px Belwe`

      if (context.measureText(text).width > textureSize.width * 0.75) {
        fontSize -= 5
      } else {
        break
      }
    } while (fontSize > 20)

    texture.clear()

    const letterSpacingAdjustments = {
      l: 0.2,
      i: 0.3,
      r: 0.1,
      a: 0.2,
      e: 0.1,
    }

    const cubicBezierVectors = BABYLON.Curve3.CreateCubicBezier(
      BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(4.5, 0, 0),
      new BABYLON.Vector3(12, 3.5, 0),
      new BABYLON.Vector3(17, 0.5, 0),
      50
    )
    const points = cubicBezierVectors.getPoints()
    const spacing = Math.floor(points.length / text.length)
    const context = texture.getContext()
    context.font = `${fontSize} Belwe`

    for (let i = 0; i < text.length; i++) {
      const letter = text[i]
      const pointIndex = i * spacing
      const position = points[pointIndex]

      const currentPoint = points[pointIndex]
      const nextPoint = points[Math.min(pointIndex + 1, points.length - 1)]
      const tangent = nextPoint.subtract(currentPoint).normalize()
      const perpendicular = new BABYLON.Vector3(-tangent.y, tangent.x, 0)
      const rotationAngle = Math.atan2(perpendicular.x, perpendicular.y)

      context.save()
      context.translate(
        position.x * ((textureSize.width / text.length) * 0.8) + 60,
        -position.y * 20 + 100 + (1 / (i + 1)) * 6
      )

      context.rotate(rotationAngle)

      const adjustment = letterSpacingAdjustments[letter] || 0
      context.translate(adjustment * fontSize, 0)

      // black outline
      // context.strokeStyle = 'black'
      // context.lineWidth = 2
      // context.strokeText(letter, 0, 0)

      context.font = `bold ${fontSize}px Belwe`
      context.fillStyle = 'white'
      context.fillText(letter, 0, 0)

      context.restore()
    }

    texture.update()

    const textMaterial = new BABYLON.StandardMaterial(
      'textMaterial',
      this.scene
    )
    textMaterial.useAlphaFromDiffuseTexture = true
    textMaterial.diffuseTexture = texture
    textMaterial.diffuseTexture.hasAlpha = true
    textMaterial.backFaceCulling = false

    const textPlane = BABYLON.MeshBuilder.CreatePlane(
      'nameBannerText',
      {
        width: parentMesh.getBoundingInfo().boundingBox.extendSize.x * 2,
        height: parentMesh.getBoundingInfo().boundingBox.extendSize.y * 2,
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

  public transformToHand(): void {
    this.mesh.scaling.set(0.3, 0.3, 1)
  }

  // private setupInteraction(): void {
  //   // Add action manager for interactions
  //   this.frame.actionManager = new BABYLON.ActionManager(this.scene)

  //   // Hover in - enlarge card
  //   this.frame.actionManager.registerAction(
  //     new BABYLON.ExecuteCodeAction(
  //       BABYLON.ActionManager.OnPointerOverTrigger,
  //       () => {
  //         if (!this.isEnlarged && !this.isReverting) {
  //           this.enlarge()
  //         }
  //       }
  //     )
  //   )

  //   // Hover out - revert card
  //   this.frame.actionManager.registerAction(
  //     new BABYLON.ExecuteCodeAction(
  //       BABYLON.ActionManager.OnPointerOutTrigger,
  //       () => {
  //         if (this.isEnlarged && !this.isReverting) {
  //           this.revert()
  //         }
  //       }
  //     )
  //   )
  // }

  // public enlarge(): void {
  //   if (this.isDragging) return

  //   this.isEnlarged = true

  //   // Create animation to enlarge card
  //   BABYLON.Animation.CreateAndStartAnimation(
  //     'enlargeCard',
  //     this.mesh,
  //     'scaling',
  //     30,
  //     15,
  //     this.mesh.scaling,
  //     new BABYLON.Vector3(0.6, 0.6, 0.6),
  //     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  //   )

  //   // Raise card position
  //   BABYLON.Animation.CreateAndStartAnimation(
  //     'raiseCard',
  //     this.mesh,
  //     'position.y',
  //     30,
  //     15,
  //     this.mesh.position.y,
  //     this.mesh.position.y + 0.5,
  //     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  //   )
  // }

  public revert(): void {
    // Create animation to revert card size
    // BABYLON.Animation.CreateAndStartAnimation(
    //   'revertCardSize',
    //   this.mesh,
    //   'scaling',
    //   30,
    //   15,
    //   this.mesh.scaling,
    //   new BABYLON.Vector3(0.4, 0.4, 0.4),
    //   BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    // )

    // Create animation to revert card position
    setTimeout(() => {
      BABYLON.Animation.CreateAndStartAnimation(
        'revertCardPosition',
        this.mesh,
        'position',
        20,
        2,
        this.mesh.position,
        this.originalPosition,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
        undefined,
        () => {}
      )
    }, 40)
  }

  public updateMana(newMana: number): void {
    this.manaText.drawText(
      newMana.toString(),
      70,
      185,
      'bold 200px Belwe',
      'white',
      null,
      true,
      true
    )
    this.manaText.update()
  }

  public updateAttack(newAttack: number): void {
    this.attackText.drawText(
      newAttack.toString(),
      96,
      210,
      'bold 200px Belwe',
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
      75,
      215,
      'bold 200px Belwe',
      'white',
      null,
      true,
      true
    )
    this.healthText.update()
  }

  public dispose(): void {
    if (MinionCardView.draggedCard === this) {
      MinionCardView.draggedCard = null
    }

    if (this.manaText) {
      this.manaText.dispose()
    }
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
    this.manaText = null
    this.attackText = null
    this.healthText = null
  }
}
