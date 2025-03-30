import * as BABYLON from 'babylonjs'
import MinionBoardView from './MinionBoardView.ts'

export default class TargetingArrowSystem {
  public isActive: boolean = false
  public sourceMinion: MinionBoardView = null

  private scene: BABYLON.Scene
  private shadowGenerator: BABYLON.ShadowGenerator
  private arrowMesh: BABYLON.Mesh = null
  private arrowMaterial: BABYLON.StandardMaterial
  private arrowColor: BABYLON.Color3 = new BABYLON.Color3(1, 0, 0)
  private dashLength: number = 0.4
  private arrowHeadSize: number = 0.5
  private cursorMesh: BABYLON.TransformNode = null
  private arrowParticles: BABYLON.Mesh[] = []
  private animationTime: number = 0
  private arcHeight: number = 0.35

  constructor(scene: BABYLON.Scene, shadowGenerator: BABYLON.ShadowGenerator) {
    this.scene = scene
    this.shadowGenerator = shadowGenerator

    this.arrowMaterial = new BABYLON.StandardMaterial(
      'arrowMaterial',
      this.scene
    )
    this.arrowMaterial.diffuseColor = this.arrowColor
    this.arrowMaterial.emissiveColor = this.arrowColor
    this.arrowMaterial.disableLighting = false
    this.arrowMaterial.specularColor = new BABYLON.Color3(0, 0, 0)

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
      dash.receiveShadows = true
      dash.isVisible = false
      this.shadowGenerator.addShadowCaster(dash)
      this.arrowParticles.push(dash)
    }
  }

  private getArcData(
    start: BABYLON.Vector3,
    end: BABYLON.Vector3,
    t: number
  ): any {
    const direction = end.subtract(start)
    const distance = direction.length()

    const a = -4 * this.arcHeight * distance
    const b = 4 * this.arcHeight * distance
    const c = 0
    const height = a * t * t + b * t + c
    const currentPos = new BABYLON.Vector3(
      start.x + direction.x * t,
      start.y + direction.y * t,
      start.z - height // Subtracting height because higher arc is negative z
    )

    const delta = 0.01
    const prevT = Math.max(0, t - delta)
    const nextT = Math.min(1, t + delta)

    const prevHeight = a * prevT * prevT + b * prevT + c
    const nextHeight = a * nextT * nextT + b * nextT + c

    const prevPos = new BABYLON.Vector3(
      start.x + direction.x * prevT,
      start.y + direction.y * prevT,
      start.z - prevHeight
    )

    const nextPos = new BABYLON.Vector3(
      start.x + direction.x * nextT,
      start.y + direction.y * nextT,
      start.z - nextHeight
    )

    const forward = nextPos.subtract(prevPos).normalize()

    const up = new BABYLON.Vector3(0, 0, -1)

    const right = BABYLON.Vector3.Cross(forward, up).normalize()

    // Recalculate up to ensure orthogonality
    const trueUp = BABYLON.Vector3.Cross(right, forward).normalize()

    return {
      position: currentPos,
      forward: forward,
      up: trueUp,
      right: right,
      height: height,
      t: t,
      a: a,
      b: b,
      c: c,
    }
  }

  private updateArrowMeshes(
    sourcePosition: BABYLON.Vector3,
    targetPosition: BABYLON.Vector3
  ): void {
    const dx = targetPosition.x - sourcePosition.x,
      dy = targetPosition.y - sourcePosition.y,
      distance = Math.sqrt(dx * dx + dy * dy),
      dashPeriod = this.dashLength + 0.2 /* gap */,
      numDashes = Math.floor(distance / dashPeriod)

    const horizontalAngle = Math.atan2(dy, dx)
    const rotationFactor = 0.15 * distance
    const rotationDirection = targetPosition.x >= sourcePosition.x ? 1 : -1

    for (let i = 0; i < this.arrowParticles.length; i++) {
      const dash = this.arrowParticles[i]
      if (i < numDashes) {
        const baseOffset =
          (i * dashPeriod + (this.animationTime % dashPeriod)) % distance

        const arcData = this.getArcData(
          sourcePosition,
          targetPosition,
          baseOffset / distance
        )

        dash.position = arcData.position.clone()

        if (!dash.rotationQuaternion) {
          dash.rotationQuaternion = new BABYLON.Quaternion()
        }

        const lookAtMatrix = BABYLON.Matrix.Identity()

        // Z axis (forward in BJS standard orientation) = our forward direction
        const zAxis = arcData.forward

        // Y axis (up in BJS standard orientation) = our up direction
        const yAxis = arcData.up

        const rotatedUpVector = new BABYLON.Vector3(
          arcData.up.x +
            Math.sin(horizontalAngle) * rotationFactor * rotationDirection,
          arcData.up.y -
            Math.cos(horizontalAngle) * rotationFactor * rotationDirection,
          arcData.up.z
        ).normalize()

        // X axis = cross product of Y and Z for orthogonality
        const xAxis = BABYLON.Vector3.Cross(rotatedUpVector, zAxis).normalize()

        // Recalculate Y to ensure perfect orthogonality
        const correctedYAxis = BABYLON.Vector3.Cross(zAxis, xAxis).normalize()

        // Set matrix values directly
        lookAtMatrix.setRowFromFloats(0, xAxis.x, xAxis.y, xAxis.z, 0)
        lookAtMatrix.setRowFromFloats(
          1,
          correctedYAxis.x,
          correctedYAxis.y,
          correctedYAxis.z,
          0
        )
        lookAtMatrix.setRowFromFloats(2, zAxis.x, zAxis.y, zAxis.z, 0)

        // Extract rotation quaternion from the matrix
        dash.rotationQuaternion =
          BABYLON.Quaternion.FromRotationMatrix(lookAtMatrix)

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
