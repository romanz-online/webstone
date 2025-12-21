import * as THREE from 'three'

export default class AttackAnimationSystem {
  private static readonly FORWARD_DURATION = 150 // ms
  private static readonly BACKWARD_DURATION = 150 // ms
  private static readonly BOUNCE_DISTANCE_RATIO = 0.75 // 75% of distance
  private static readonly Z_LIFT = 0.1 // Lift attacker above other elements

  public animateAttack(
    attackerMesh: THREE.Mesh,
    targetMesh: THREE.Mesh
  ): Promise<void> {
    return new Promise((resolve) => {
      // Cancel any existing animation on this mesh
      if ((attackerMesh as any).animationId) {
        cancelAnimationFrame((attackerMesh as any).animationId)
      }

      // Store original position
      const originalPosition = attackerMesh.position.clone()
      const originalZ = originalPosition.z

      // Calculate bounce target (75% distance toward target)
      const targetPosition = targetMesh.position.clone()
      const bounceTarget = new THREE.Vector3()
      bounceTarget.lerpVectors(
        originalPosition,
        targetPosition,
        AttackAnimationSystem.BOUNCE_DISTANCE_RATIO
      )
      bounceTarget.z = originalZ + AttackAnimationSystem.Z_LIFT

      // Phase 1: Animate forward
      const startTime = Date.now()

      const animateForward = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(
          elapsed / AttackAnimationSystem.FORWARD_DURATION,
          1
        )
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease-out

        // Interpolate position
        attackerMesh.position.lerpVectors(
          originalPosition,
          bounceTarget,
          easeProgress
        )

        if (progress < 1) {
          ;(attackerMesh as any).animationId =
            requestAnimationFrame(animateForward)
        } else {
          // Phase 2: Animate backward
          const backStartTime = Date.now()

          const animateBackward = () => {
            const backElapsed = Date.now() - backStartTime
            const backProgress = Math.min(
              backElapsed / AttackAnimationSystem.BACKWARD_DURATION,
              1
            )
            const backEaseProgress = 1 - Math.pow(1 - backProgress, 3) // Cubic ease-out

            // Interpolate back to original position
            attackerMesh.position.lerpVectors(
              bounceTarget,
              originalPosition,
              backEaseProgress
            )

            if (backProgress < 1) {
              ;(attackerMesh as any).animationId =
                requestAnimationFrame(animateBackward)
            } else {
              // Animation complete
              attackerMesh.position.copy(originalPosition)
              ;(attackerMesh as any).animationId = undefined
              resolve()
            }
          }

          animateBackward()
        }
      }

      animateForward()
    })
  }
}
