const eventHandlers = {}

export const wsEventHandler = ({
  socket,
  event,
  onSuccess,
  onFailure = () => {},
}) => {
  if (typeof onSuccess != 'function') {
    console.error(`${event} onSuccess clause must be a function`)
    return
  }

  if (!eventHandlers[event]) {
    eventHandlers[event] = []
  }

  eventHandlers[event].push({ onSuccess, onFailure })

  socket.addEventListener('message', (evt) => {
    const { signature, success, data } = JSON.parse(evt.data)

    // not the right instance of wsEventHandler for this signature
    if (event != signature) {
      return
    }

    // no handlers specified for the signature
    if (!eventHandlers[signature]) {
      return
    }

    eventHandlers[signature].forEach((handler) => {
      console.log(success ? 'SUCCESS' : 'FAIL', signature)

      if (success) {
        handler.onSuccess(data)
      } else {
        handler.onFailure(data)
      }
    })
  })
}
