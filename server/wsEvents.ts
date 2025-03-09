import { engine } from '@engine'
import GameState from '@gameState'
import Event from 'eventData/Event.ts'
import { setSocket } from '@ws'

export const gameState = new GameState()

export const processEvent = async (ws: WebSocket, json: any): Promise<void> => {
  setSocket(ws)
  engine.queuePlayerAction(generateEvent(json))
}

const generateEvent = (json) => {
  return new Event(json.event, json.data)
}
