import { engine } from './Engine'
import GameState from './GameState'
import Event from './event'
import { setSocket } from './ws'

export const gameState = new GameState()

export const processEvent = async (ws: WebSocket, json: any): Promise<void> => {
  setSocket(ws)
  engine.queuePlayerAction([new Event(json.event, json.data)])
}
