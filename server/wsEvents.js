const { engine } = require('./engine')
const { gameState } = require('./gameState.js')

const sendEvent = (ws, event, success, data) => {
  ws.send(
    JSON.stringify({
      signature: event,
      success: success,
      data: data,
    })
  )
}

engine.on('eventFinished', (ws, event, data) => {
  // sendEvent(event, data) // WILL NEED TO GENERATE DATA SOMEHOW DEPENDING ON WHAT EVENT IS FIRING
  sendEvent(ws, 'getGameState', true, gameState.toJSON()) // FOR NOW JUST SENDING FULL GAME STATE EACH TIME
})

const processEvent = async (ws, json) => {
  const { event, data } = json
  if (event === 'getGameState') {
    sendEvent(ws, 'getGameState', true, gameState.toJSON())
  } else {
    engine.queueEvent(ws, event, data)
  }
}

module.exports = { processEvent }

// const queryHandler = require('./queryHandler.js');
// const KEYS = { // SQL keys
//     REMAINING_LETTERS: 'remaining_letters',
//     PLAYER_COUNT: 'player_count',
//     BOARD_STATE: 'board_state',
//     WHOSE_TURN: 'whose_turn',
//     ROOM_CODE: 'room_code',
//     IP1: 'ip1',
//     IP2: 'ip2',
//     IP3: 'ip3',
//     IP4: 'ip4',
//     PASS1: 'pass1',
//     PASS2: 'pass2',
//     PASS3: 'pass3',
//     PASS4: 'pass4',
//     POINTS1: 'points1',
//     POINTS2: 'points2',
//     POINTS3: 'points3',
//     POINTS4: 'points4',
//     DOCK1: 'dock1',
//     DOCK2: 'dock2',
//     DOCK3: 'dock3',
//     DOCK4: 'dock4',
//     LAST_MODIFIED: 'last_modified'
// };

// async function getRecord(id) {
//     console.log(signature);

//     try {
//         const params = { where: [{ key: KEYS.ROOM_CODE, value: id }] };
//         const result = await queryHandler.select(params);
//         return result[0]; // query only ever returns one row since id is unique
//     } catch (err) {
//         console.error(err);
//         throw err;
//     }
// }

// const record = await getRecord(id);
// const scoreboard = [
//     [record[KEYS.IP1], record[KEYS.POINTS1]],
//     [record[KEYS.IP2], record[KEYS.POINTS2]],
//     [record[KEYS.IP3], record[KEYS.POINTS3]],
//     [record[KEYS.IP4], record[KEYS.POINTS4]]
// ];
