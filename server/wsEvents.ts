import { engine } from './engine'
import { GameState } from './gameState'
import { setSocket } from './ws'

export const gameState = new GameState()

export const processEvent = async (ws: WebSocket, json: any): Promise<void> => {
  setSocket(ws)
  engine.queueEvent([json])
}
