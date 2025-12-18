import * as THREE from 'three'
import PlayerMinionBoard from './PlayerMinionBoard.ts'
import PlayerPortrait from './PlayerPortrait.ts'
import { Layer } from './gameConstants.ts'

type TargetingSource = PlayerMinionBoard | PlayerPortrait

export default class TargetingArrowSystem {
  public isActive: boolean = false
  public sourceMinion: TargetingSource = null

  private scene: THREE.Scene
  private arrowMaterial: THREE.MeshBasicMaterial
  private arrowColor: THREE.Color = new THREE.Color(1, 0.1, 0.1)
  private dashLength: number = 0.6
  private cursorMesh: THREE.Object3D = null
  private arrowParticles: THREE.Mesh[] = []
  private animationTime: number = 0
  private arcHeight: number = Layer.TARGETING_SYSTEM

  constructor(scene: THREE.Scene) {
    this.scene = scene

    this.arrowMaterial = new THREE.MeshBasicMaterial({
      color: this.arrowColor,
      transparent: true,
      opacity: 0.8,
    })

    // Use animation loop instead of registerBeforeRender
    const animate = () => {
      if (this.isActive) {
        this.animationTime += 0.025 // Fixed delta time for consistency
        this.updateArrowAnimation()
      }
      requestAnimationFrame(animate)
    }
    animate()
  }

  public startTargeting(sourceMinion: TargetingSource): void {
    this.sourceMinion = sourceMinion
    this.isActive = true
    this.createCursorMesh()
    this.createArrowDashes()
  }

  public updateTargetingPosition(pointerPosition: THREE.Vector3): void {
    if (!this.isActive || !this.sourceMinion) return

    this.cursorMesh.position.copy(pointerPosition)
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
    this.cursorMesh = new THREE.Object3D()
    this.cursorMesh.name = 'cursorMesh'
    this.scene.add(this.cursorMesh)

    const ringGeometry = new THREE.TorusGeometry(0.375, 0.045, 8, 32)
    const ring = new THREE.Mesh(ringGeometry, this.arrowMaterial.clone())
    ring.rotation.x = Math.PI / 2
    ring.name = 'targetingRing'
    this.cursorMesh.add(ring)
  }

  private createArrowDashes(): void {
    this.arrowParticles = []

    const totalRectangles = 15
    for (let i = 0; i < totalRectangles; i++) {
      const rectangleGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.45)
      const rectangle = new THREE.Mesh(
        rectangleGeometry,
        this.arrowMaterial.clone()
      )

      rectangle.name = `arrowRectangle_${i}`
      rectangle.visible = false
      this.scene.add(rectangle)
      this.arrowParticles.push(rectangle)
    }
  }

  private getArcData(start: THREE.Vector3, end: THREE.Vector3, t: number): any {
    const direction = end.clone().sub(start)
    const distance = direction.length()

    const a = -4 * this.arcHeight * distance
    const b = 4 * this.arcHeight * distance
    const c = 0
    const height = a * t * t + b * t + c

    const currentPos = new THREE.Vector3(
      start.x + direction.x * t,
      start.y + direction.y * t,
      start.z + height // Adding height to move towards camera (positive z)
    )

    const delta = 0.01
    const prevT = Math.max(0, t - delta)
    const nextT = Math.min(1, t + delta)

    const prevHeight = a * prevT * prevT + b * prevT + c
    const nextHeight = a * nextT * nextT + b * nextT + c

    const prevPos = new THREE.Vector3(
      start.x + direction.x * prevT,
      start.y + direction.y * prevT,
      start.z + prevHeight
    )

    const nextPos = new THREE.Vector3(
      start.x + direction.x * nextT,
      start.y + direction.y * nextT,
      start.z + nextHeight
    )

    const forward = nextPos.clone().sub(prevPos).normalize()
    const up = new THREE.Vector3(0, 0, -1)
    const right = new THREE.Vector3().crossVectors(forward, up).normalize()
    const trueUp = new THREE.Vector3().crossVectors(right, forward).normalize()

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
    sourcePosition: THREE.Vector3,
    targetPosition: THREE.Vector3
  ): void {
    const dx = targetPosition.x - sourcePosition.x
    const dy = targetPosition.y - sourcePosition.y
    const distance = Math.sqrt(dx * dx + dy * dy) - 1
    const dashPeriod = this.dashLength + 0.2 /* gap */
    const numDashes = Math.floor(distance / dashPeriod)

    const horizontalAngle = Math.atan2(dy, dx)
    const rotationFactor = 0.05 * distance
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

        dash.position.copy(arcData.position)

        // Build proper orientation matrix
        const cameraDir = new THREE.Vector3(0, 0, 1) // Toward camera

        // Calculate thin dimension (local X-axis): project camera onto plane perpendicular to forward
        const thin = cameraDir.clone()
          .sub(arcData.forward.clone().multiplyScalar(arcData.forward.dot(cameraDir)))

        // Handle edge case: forward parallel to camera direction
        if (thin.length() < 0.01) {
          thin.set(1, 0, 0) // Fallback
        } else {
          thin.normalize()
        }

        // Calculate medium dimension (local Y-axis): perpendicular to forward and thin
        const medium = new THREE.Vector3()
          .crossVectors(arcData.forward, thin)
          .normalize()

        // Build rotation matrix: makeBasis(xAxis, yAxis, zAxis)
        //   xAxis = thin (0.15 width, toward/away camera)
        //   yAxis = medium (0.3 height, perpendicular)
        //   zAxis = forward (0.45 depth, along arc)
        const rotationMatrix = new THREE.Matrix4().makeBasis(thin, medium, arcData.forward)

        // Apply orientation
        dash.rotation.setFromRotationMatrix(rotationMatrix)

        dash.visible = true
      } else {
        dash.visible = false
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
      this.cursorMesh.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose())
            } else {
              object.material.dispose()
            }
          }
          if (object.geometry) {
            object.geometry.dispose()
          }
        }
      })
      this.scene.remove(this.cursorMesh)
      this.cursorMesh = null
    }

    this.arrowParticles.forEach((dash) => {
      if (dash) {
        if (dash.material) {
          if (Array.isArray(dash.material)) {
            dash.material.forEach((mat) => mat.dispose())
          } else {
            dash.material.dispose()
          }
        }
        if (dash.geometry) {
          dash.geometry.dispose()
        }
        this.scene.remove(dash)
      }
    })
    this.arrowParticles = []
  }
}
