import { engine } from './Engine'
import GameState from './GameState'
import Event from './event'
import { notifyClient, setSocket } from './ws'

export const gameState = new GameState()

export const processEvent = async (ws: WebSocket, json: any): Promise<void> => {
  setSocket(ws)
  if (json.event === 'getGameState') {
    notifyClient(json.event, true, gameState.toJSON())
  } else if (json.event === 'target') {
    gameState.target(json.data.targetID)
  } else {
    // anything that can set off board interactions
    engine.queuePlayerAction([new Event(json.event, json.data)])
  }
}
