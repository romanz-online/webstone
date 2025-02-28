const { engine } = require('./engine')
const { gameState } = require('./gameState.js')

let socket

const sendEvent = (event, success, data) => {
  socket?.send(
    JSON.stringify({
      signature: event,
      success: success,
      data: data,
    })
  )
}

engine.on('eventFinished', (event, data) => {
  if (event === 'minionPlayed') {
    // sendEvent(event, data) // WILL NEED TO GENERATE DATA SOMEHOW DEPENDING ON WHAT EVENT IS FIRING
    sendEvent('getGameState', true, gameState.toJSON()) // FOR NOW JUST SENDING FULL GAME STATE EACH TIME
  } else {
    sendEvent('getGameState', true, gameState.toJSON())
  }
})

const processEvent = async (ws, json) => {
  socket = ws
  const { event, data } = json
  if (event === 'getGameState') {
    sendEvent('getGameState', true, gameState.toJSON())
  } else {
    engine.queueEvent(event, data)
  }
}

module.exports = { processEvent }
