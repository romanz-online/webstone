import * as BABYLON from 'babylonjs'
import MinionBoardView from './MinionBoardView.ts'

export default class TargetingArrowSystem {
  public isActive: boolean = false
  public sourceMinion: MinionBoardView = null

  private scene: BABYLON.Scene
  private arrowMesh: BABYLON.Mesh = null
  private arrowMaterial: BABYLON.StandardMaterial
  private arrowColor: BABYLON.Color3 = new BABYLON.Color3(1, 0, 0)
  private arrowWidth: number = 0.3
  private dashLength: number = 0.4
  private dashGap: number = 0.3
  private animationSpeed: number = 1.5
  private cursorRadius: number = 0.6
  private arrowHeadSize: number = 0.5
  private cursorMesh: BABYLON.TransformNode = null
  private arrowParticles: BABYLON.Mesh[] = []
  private animationTime: number = 0
  private arcHeight: number = 10.0

  constructor(scene: BABYLON.Scene) {
    this.scene = scene

    this.arrowMaterial = new BABYLON.StandardMaterial(
      'arrowMaterial',
      this.scene
    )
    this.arrowMaterial.diffuseColor = this.arrowColor
    this.arrowMaterial.emissiveColor = this.arrowColor

    this.scene.registerBeforeRender(() => {
      if (this.isActive) {
        this.animationTime +=
          (this.scene.getEngine().getDeltaTime() / 1000) * this.animationSpeed
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
        diameter: this.cursorRadius * 2,
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
          width: this.arrowWidth,
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

  // Calculate position on a simple parabolic arc
  private getArcPoint(
    start: BABYLON.Vector3,
    end: BABYLON.Vector3,
    t: number // 0-1 along the path
  ): BABYLON.Vector3 {
    // Linear interpolation for x and y
    const x = start.x + (end.x - start.x) * t
    const y = start.y + (end.y - start.y) * t

    // Parabolic arc for z (height)
    // Simple parabola: z = 4 * h * t * (1-t) where h is max height
    // This gives z=0 at t=0 and t=1, and z=h at t=0.5
    const z = 4 * this.arcHeight * t * (1 - t)

    return new BABYLON.Vector3(x, y, z)
  }

  // Calculate tangent at point t along the simple arc
  private getArcTangent(
    start: BABYLON.Vector3,
    end: BABYLON.Vector3,
    t: number
  ): BABYLON.Vector3 {
    // Derivative of position with respect to t
    const dx = end.x - start.x
    const dy = end.y - start.y

    // Derivative of z = 4 * h * t * (1-t) is z' = 4 * h * (1-2t)
    const dz = 2 * this.arcHeight * (1 - 2 * t)

    return new BABYLON.Vector3(Math.PI * 0.1, Math.PI * 3, dz).normalize()
  }

  // Update arrow meshes between source and target using a simple arc
  private updateArrowMeshes(
    sourcePosition: BABYLON.Vector3,
    targetPosition: BABYLON.Vector3
  ): void {
    // Calculate the total distance (in 2D, ignoring height)
    const dx = targetPosition.x - sourcePosition.x
    const dy = targetPosition.y - sourcePosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Calculate number of dashes that fit along the arc
    const dashPeriod = this.dashLength + this.dashGap
    const numDashes = Math.floor(distance / dashPeriod)

    for (let i = 0; i < this.arrowParticles.length; i++) {
      const dash = this.arrowParticles[i]

      if (i < numDashes) {
        // Position base is determined by animation time and period
        let baseOffset =
          (i * dashPeriod + (this.animationTime % dashPeriod)) % distance

        // Parameter t along the arc (0-1)
        const t = baseOffset / distance

        // Get position on the arc
        const position = this.getArcPoint(sourcePosition, targetPosition, t)

        // Get tangent direction for orienting the dash
        const tangent = this.getArcTangent(sourcePosition, targetPosition, t)

        // Position the dash
        dash.position = position

        // Orient the dash along the tangent direction
        const lookAtPoint = position.add(tangent)
        dash.lookAt(lookAtPoint)

        // Make dash visible
        dash.isVisible = true
      } else {
        // Hide unnecessary dashes
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
