import { CardType, PlayerID } from '@constants'

/**
 * Event data interfaces for WebSocket communication
 * These define the exact data structure required for each event type
 */

// Try Event Data Interfaces (Client → Server)

export interface TryPlayMinionData {
  cardType: CardType.Minion
  boardIndex: number
  minionID: number  
  playerID: PlayerID
}

export interface TryPlaySpellData {
  cardType: CardType.Spell
  cardID: number
  playerID: PlayerID
}

export interface TryPlayWeaponData {
  cardType: CardType.Weapon
  cardID: number
  playerID: PlayerID
}

export interface TryAttackData {
  attackerID: number
  targetID: number
}

export interface TryTargetData {
  targetID: number
}

// Union type for TryPlayCard data based on card type
export type TryPlayCardData = TryPlayMinionData | TryPlaySpellData | TryPlayWeaponData

// Events that require no data
export interface NoEventData {}

/**
 * Event data mapping for type safety
 */
export interface EventDataMap {
  TryLoad: NoEventData
  TryEndTurn: NoEventData
  TryCancel: NoEventData
  TryHeroPower: NoEventData
  TryPlayCard: TryPlayCardData
  TryAttack: TryAttackData
  TryTarget: TryTargetData
}