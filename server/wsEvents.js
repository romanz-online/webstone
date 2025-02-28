const { engine } = require('./engine')
const GameState = require('./gameState')
const { setSocket } = require('./ws.js')

// NEED TO FIGURE OUT A BETTER WAY TO DO THIS
const gameState = new GameState()

const processEvent = async (ws, json) => {
  setSocket(ws)
  engine.queueEvent([json])
}

module.exports = { processEvent }
