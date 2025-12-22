import * as THREE from 'three'
import Hero from './Hero.ts'
import { Layer } from './gameConstants.ts'

interface HeroData {
  id?: number
  attack?: number
  health?: number
  maxHealth?: number
}

export default class PlayerPortrait {
  public hero: Hero
  public mesh: THREE.Mesh
  public originalPosition: THREE.Vector3

  private static readonly PLAYER_Y_POSITION = -2.3

  constructor(
    scene: THREE.Scene,
    heroData: HeroData = {},
    position?: THREE.Vector3
  ) {
    // Create the hero with default positioning
    this.hero = new Hero(scene, heroData)

    // Set player-specific positioning
    const playerPosition =
      position ||
      new THREE.Vector3(0, PlayerPortrait.PLAYER_Y_POSITION, Layer.HERO)
    this.hero.mesh.position.copy(playerPosition)

    // Expose the hero's mesh for interaction systems
    this.mesh = this.hero.mesh
    this.mesh.userData = { owner: this }

    this.originalPosition = this.mesh.position.clone()
  }

  public setDepth(depth: number): void {
    this.hero.setDepth(depth)
  }

  public getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 } {
    return this.hero.getBoundingInfo()
  }

  public updateAttack(newAttack: number): void {
    this.hero.updateAttack(newAttack)
  }

  public updateHealth(newHealth: number): void {
    this.hero.updateHealth(newHealth)
  }

  public updateMaxHealth(newMaxHealth: number): void {
    this.hero.updateMaxHealth(newMaxHealth)
  }

  public dispose(): void {
    this.hero.dispose()
  }
}
