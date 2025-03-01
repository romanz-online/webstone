const { engine } = require('./engine.js')
const { gameState } = require('./gameState.js')
const { setSocket } = require('./ws.js')

const processEvent = async (ws, json) => {
  setSocket(ws)
  engine.queueEvent([json])
}

module.exports = { processEvent }
