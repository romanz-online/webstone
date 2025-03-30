import * as BABYLON from 'babylonjs'
import MinionBoardView from './MinionBoardView.ts'

export default class TargetingArrowSystem {
  public isActive: boolean = false
  public sourceMinion: MinionBoardView = null

  private scene: BABYLON.Scene
  private arrowMesh: BABYLON.Mesh = null
  private arrowMaterial: BABYLON.StandardMaterial
  private arrowColor: BABYLON.Color3 = new BABYLON.Color3(1, 0, 0)
  private dashLength: number = 0.4
  private arrowHeadSize: number = 0.5
  private cursorMesh: BABYLON.TransformNode = null
  private arrowParticles: BABYLON.Mesh[] = []
  private animationTime: number = 0
  private arcHeight: number = 20.0

  constructor(scene: BABYLON.Scene) {
    this.scene = scene

    this.arrowMaterial = new BABYLON.StandardMaterial(
      'arrowMaterial',
      this.scene
    )
    this.arrowMaterial.diffuseColor = this.arrowColor
    this.arrowMaterial.emissiveColor = this.arrowColor
    // this.arrowMaterial.specularColor = new BABYLON.Color3(0, 0, 0)

    this.scene.registerBeforeRender(() => {
      if (this.isActive) {
        this.animationTime +=
          (this.scene.getEngine().getDeltaTime() / 1000) * 1.5
        this.updateArrowAnimation()
      }
    })
  }

  public startTargeting(sourceMinion: MinionBoardView): void {
    this.sourceMinion = sourceMinion
    this.isActive = true
    this.createCursorMesh()
    this.createArrowDashes()
  }

  public updateTargetingPosition(pointerPosition: BABYLON.Vector3): void {
    if (!this.isActive || !this.sourceMinion) return

    this.cursorMesh.position = pointerPosition.clone()
    this.updateArrowMeshes(
      this.sourceMinion.mesh.position.clone(),
      pointerPosition
    )
  }

  public endTargeting(): void {
    this.isActive = false
    this.sourceMinion = null
    this.disposeMeshes()
  }

  private createCursorMesh(): void {
    this.cursorMesh = new BABYLON.TransformNode('cursorMesh', this.scene)

    const circle = BABYLON.MeshBuilder.CreateTorus(
      'cursorCircle',
      {
        diameter: 0.6 * 2,
        thickness: 0.1,
        tessellation: 32,
      },
      this.scene
    )
    circle.parent = this.cursorMesh
    circle.material = this.arrowMaterial.clone('cursorMaterial')

    const arrowHead = BABYLON.MeshBuilder.CreateCylinder(
      'arrowHead',
      {
        height: this.arrowHeadSize,
        diameterTop: 0,
        diameterBottom: this.arrowHeadSize,
        tessellation: 12,
      },
      this.scene
    )
    arrowHead.parent = this.cursorMesh
    arrowHead.position.y = 0.3
    arrowHead.rotation.x = Math.PI / 2
    arrowHead.material = this.arrowMaterial.clone('arrowHeadMaterial')

    this.cursorMesh.position = new BABYLON.Vector3(0, 0, 0)
  }

  private createArrowDashes(): void {
    this.arrowParticles = []

    const totalDashes = 20
    for (let i = 0; i < totalDashes; i++) {
      const dash = BABYLON.MeshBuilder.CreateBox(
        `arrowDash_${i}`,
        {
          width: 0.3,
          height: 0.1,
          depth: this.dashLength,
        },
        this.scene
      )

      dash.material = this.arrowMaterial.clone(`dashMaterial_${i}`)
      dash.isVisible = false
      this.arrowParticles.push(dash)
    }
  }

  private getArcData(
    start: BABYLON.Vector3,
    end: BABYLON.Vector3,
    t: number
  ): any {
    const mid = new BABYLON.Vector3(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2,
        this.arcHeight
      ),
      points = BABYLON.Curve3.CreateQuadraticBezier(
        start,
        mid,
        end,
        300
      ).getPoints(),
      index = Math.floor(t * (points.length - 1)),
      point = points[Math.max(0, Math.min(points.length - 1, index))],
      nextPoint = points[Math.min(index + 1, points.length - 1)],
      tangent = nextPoint.subtract(point).normalize()
    return {
      position: point,
      tangent: tangent,
    }
  }

  private updateArrowMeshes(
    sourcePosition: BABYLON.Vector3,
    targetPosition: BABYLON.Vector3
  ): void {
    const dx = targetPosition.x - sourcePosition.x,
      dy = targetPosition.y - sourcePosition.y,
      distance = Math.sqrt(dx * dx + dy * dy),
      dashPeriod = this.dashLength + 0.3 /* gap */,
      numDashes = Math.floor(distance / dashPeriod)

    for (let i = 0; i < this.arrowParticles.length; i++) {
      const dash = this.arrowParticles[i]
      if (i < numDashes) {
        const baseOffset =
          (i * dashPeriod + (this.animationTime % dashPeriod)) % distance

        const { position, tangent } = this.getArcData(
          sourcePosition,
          targetPosition,
          baseOffset / distance
        )
        dash.position = position

        if (!dash.rotationQuaternion) {
          dash.rotationQuaternion = new BABYLON.Quaternion()
          dash.rotation = BABYLON.Vector3.Zero()
        }

        const up = new BABYLON.Vector3(0, 0, 1)
        const lookAtMatrix = BABYLON.Matrix.LookAtLH(
          position,
          position.add(tangent),
          up
        )

        const lookAtQuaternion =
          BABYLON.Quaternion.FromRotationMatrix(lookAtMatrix).invert()

        const adjustmentQuaternion = BABYLON.Quaternion.RotationAxis(
          new BABYLON.Vector3(0, 1, 0),
          -Math.PI / 2
        )

        dash.rotationQuaternion =
          adjustmentQuaternion.multiply(lookAtQuaternion)

        dash.isVisible = true
      } else {
        dash.isVisible = false
      }
    }
  }

  private updateArrowAnimation(): void {
    if (!this.isActive || !this.sourceMinion) return

    this.updateArrowMeshes(
      this.sourceMinion.mesh.position.clone(),
      this.cursorMesh.position.clone()
    )
  }

  public disposeMeshes(): void {
    if (this.cursorMesh) {
      this.cursorMesh.getChildMeshes().forEach((mesh) => mesh.dispose())
      this.cursorMesh.dispose()
      this.cursorMesh = null
    }

    this.arrowParticles.forEach((dash) => {
      if (dash) dash.dispose()
    })
    this.arrowParticles = []
  }
}
