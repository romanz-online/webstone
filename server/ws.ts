import { EventType } from '@constants'

/**
 * WebSocket Event System
 *
 * This module handles WebSocket communication between client and server.
 * Event data requirements are documented in eventData/EventInterfaces.ts
 *
 * Event Types and Data Requirements:
 * - EventType.TryLoad: No data
 * - EventType.TryEndTurn: No data
 * - EventType.TryCancel: No data
 * - EventType.TryHeroPower: No data (not implemented)
 * - EventType.TryPlayCard: { cardType, boardIndex?, minionID?, cardID?, playerID }
 * - EventType.TryAttack: { attackerID, targetID }
 * - EventType.TryTarget: { targetID }
 */

let socket: WebSocket | null = null

export const setSocket = (ws: WebSocket): void => {
  socket = ws
}

const getEventTypeName = (event: EventType): string => {
  return (
    Object.keys(EventType)[Object.values(EventType).indexOf(event)] ||
    `Unknown(${event})`
  )
}

export const notifyClient = (
  event: EventType,
  success: boolean,
  data: any
): void => {
  console.log('Sending event to client:', getEventTypeName(event))
  socket?.send(
    JSON.stringify({
      eventType: event,
      success: success,
      data: data,
    })
  )
}
