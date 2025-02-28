let socket

const setSocket = (ws) => {
  socket = ws
}

const notifyClient = (event, success, data) => {
  socket?.send(
    JSON.stringify({
      signature: event,
      success: success,
      data: data,
    })
  )
}

module.exports = { setSocket, notifyClient }
