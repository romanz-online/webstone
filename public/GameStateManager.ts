import * as THREE from 'three'
import AttackAnimationSystem from './AttackAnimationSystem.ts'
import DamageIndicator from './DamageIndicator.ts'
import { Layer } from './gameConstants.ts'
import MinionCard from './MinionCard.ts'
import MinionModel from './MinionModel.ts'
import OpponentBoard from './OpponentBoard.ts'
import OpponentMinionBoard from './OpponentMinionBoard.ts'
import OpponentPortrait from './OpponentPortrait.ts'
import PlayerBoard from './PlayerBoard.ts'
import PlayerHand from './PlayerHand.ts'
import PlayerMinionBoard from './PlayerMinionBoard.ts'
import PlayerPortrait from './PlayerPortrait.ts'

export default class GameStateManager extends EventTarget {
  private scene: THREE.Scene
  private playerBoard: PlayerBoard
  private opponentBoard: OpponentBoard
  private playerPortrait: PlayerPortrait
  private opponentPortrait: OpponentPortrait
  private playerHand: PlayerHand
  private attackAnimationSystem: AttackAnimationSystem

  constructor(scene: THREE.Scene) {
    super()
    this.scene = scene
    this.attackAnimationSystem = new AttackAnimationSystem()
  }

  public initialize(): void {
    this.playerPortrait = new PlayerPortrait(this.scene)
    this.opponentPortrait = new OpponentPortrait(this.scene)

    this.playerHand = new PlayerHand(this.scene)
    this.playerHand.mesh.position.z = Layer.HAND

    this.playerBoard = new PlayerBoard(this.scene)
    this.playerBoard.mesh.position.z = Layer.BOARD

    this.opponentBoard = new OpponentBoard(this.scene)
    this.opponentBoard.mesh.position.z = Layer.BOARD
  }

  public loadServerGameState(data: any): void {
    const minionCardViews: MinionCard[] = []
    const playerBoardViews: PlayerMinionBoard[] = []
    const opponentBoardViews: OpponentMinionBoard[] = []

    // Update hero data from server
    if (data.player1 && data.player1.hero) {
      this.playerPortrait.hero.updateFromServerData(data.player1.hero)
    }
    if (data.player2 && data.player2.hero) {
      this.opponentPortrait.hero.updateFromServerData(data.player2.hero)
    }

    data.player1.hand.forEach((card: any) => {
      const model = new MinionModel(card)
      const cardView = new MinionCard(this.scene, model)
      minionCardViews.push(cardView)
    })

    // Differential update for player board minions
    data.player1.board.forEach((minionData: any) => {
      // Check if minion already exists
      const existingMinion = this.playerBoard.minions.find(
        (m) => m.minion.id === minionData.id
      )

      if (existingMinion) {
        // Update existing minion
        existingMinion.minion.attack = minionData.attack
        existingMinion.minion.health = minionData.health
        existingMinion.minion.currentHealth = minionData.currentHealth
        existingMinion.minion.canAttack = minionData.canAttack

        // Update visual indicators
        existingMinion.updateAttack(minionData.attack)
        existingMinion.updateHealth(minionData.currentHealth)
        existingMinion.updateCanAttack(minionData.canAttack)

        playerBoardViews.push(existingMinion)
      } else {
        // Create new minion
        const model = new MinionModel(minionData)
        const boardView = new PlayerMinionBoard(this.scene, model)
        playerBoardViews.push(boardView)
      }
    })

    // Dispose minions that no longer exist
    const removedPlayerMinions = this.playerBoard.minions.filter(
      (existing) => !playerBoardViews.includes(existing)
    )
    for (const removed of removedPlayerMinions) {
      removed.dispose()
    }

    // Differential update for opponent board minions
    if (data.player2 && data.player2.board) {
      data.player2.board.forEach((minionData: any) => {
        // Check if minion already exists
        const existingMinion = this.opponentBoard.minions.find(
          (m) => m.minion.id === minionData.id
        )

        if (existingMinion) {
          // Update existing minion
          existingMinion.minion.attack = minionData.attack
          existingMinion.minion.health = minionData.health
          existingMinion.minion.currentHealth = minionData.currentHealth
          existingMinion.minion.canAttack = minionData.canAttack

          // Update visual indicators
          existingMinion.updateAttack(minionData.attack)
          existingMinion.updateHealth(minionData.currentHealth)

          opponentBoardViews.push(existingMinion)
        } else {
          // Create new minion
          const model = new MinionModel(minionData)
          const boardView = new OpponentMinionBoard(this.scene, model)
          opponentBoardViews.push(boardView)
        }
      })

      // Dispose minions that no longer exist
      const removedOpponentMinions = this.opponentBoard.minions.filter(
        (existing) => !opponentBoardViews.includes(existing)
      )
      for (const removed of removedOpponentMinions) {
        removed.dispose()
      }
    }

    this.playerHand.setHandData(minionCardViews)
    this.playerBoard.setBoardData(playerBoardViews)
    this.opponentBoard.setBoardData(opponentBoardViews)

    // Emit event to notify that state is loaded
    this.dispatchEvent(
      new CustomEvent('stateloaded', {
        detail: { cards: minionCardViews },
      })
    )
  }

  public summonMinion(data: any): void {
    const model = new MinionModel(data.minionData)
    const boardView = new PlayerMinionBoard(this.scene, model)
    this.playerBoard.summonMinion(boardView, data.boardIndex)
  }

  public playCard(data: any, success: boolean): void {
    const card = this.playerHand.cards.find((c) => c.minion.id === data.cardID)
    if (success) {
      if (card) {
        this.dispatchEvent(
          new CustomEvent('cardplayed', {
            detail: { card },
          })
        )
        this.playerHand.removeCard(card)
      }
    } else if (card) {
      card.revert()
    }
  }

  public async handleAttackEvent(data: {
    attackerID: number
    targetID: number
  }): Promise<void> {
    const attackerMesh = this.findCharacterMeshByID(data.attackerID)
    const targetMesh = this.findCharacterMeshByID(data.targetID)

    if (!attackerMesh) {
      console.error(`Could not find attacker mesh for ID ${data.attackerID}`)
      return
    }
    if (!targetMesh) {
      console.error(`Could not find target mesh for ID ${data.targetID}`)
      return
    }

    await this.attackAnimationSystem.animateAttack(attackerMesh, targetMesh)
  }

  public handleDamageEvent(data: {
    damages: Array<{ targetID: number; amount: number; currentHealth: number }>
  }): void {
    if (!data.damages) {
      console.error('No damages data received')
      return
    }

    for (const damage of data.damages) {
      const targetMesh = this.findCharacterMeshByID(damage.targetID)

      if (!targetMesh) {
        console.error(`Could not find target mesh for ID ${damage.targetID}`)
        continue
      }

      // Spawn floating damage text
      new DamageIndicator(this.scene, targetMesh.position, damage.amount, false)

      // Update health indicators on affected characters
      // Check if it's a hero portrait
      if (
        this.playerPortrait.hero.id === damage.targetID ||
        this.opponentPortrait.hero.id === damage.targetID
      ) {
        const portrait =
          this.playerPortrait.hero.id === damage.targetID
            ? this.playerPortrait
            : this.opponentPortrait
        portrait.updateHealth(damage.currentHealth)
      } else {
        // It's a minion
        for (const minion of this.playerBoard.minions) {
          if (minion.minion.id === damage.targetID) {
            minion.updateHealth(damage.currentHealth)
            break
          }
        }
        for (const minion of this.opponentBoard.minions) {
          if (minion.minion.id === damage.targetID) {
            minion.updateHealth(damage.currentHealth)
            break
          }
        }
      }
    }
  }

  private findCharacterMeshByID(id: number): THREE.Mesh | null {
    // Check player portrait
    if (this.playerPortrait.hero.id === id) {
      return this.playerPortrait.mesh
    }
    // Check opponent portrait
    if (this.opponentPortrait.hero.id === id) {
      return this.opponentPortrait.mesh
    }
    // Check player board minions
    for (const minion of this.playerBoard.minions) {
      if (minion.minion.id === id) {
        return minion.mesh
      }
    }
    // Check opponent board minions
    for (const minion of this.opponentBoard.minions) {
      if (minion.minion.id === id) {
        return minion.mesh
      }
    }
    return null
  }

  public getPlayerBoard(): PlayerBoard {
    return this.playerBoard
  }

  public getPlayerHand(): PlayerHand {
    return this.playerHand
  }

  public dispose(): void {
    this.playerBoard.clear()
    this.opponentBoard.clear()
    // PlayerHand doesn't have clear(), so dispose cards manually
    this.playerHand.cards.forEach((card) => card.dispose())
    this.playerHand.cards = []
  }
}
