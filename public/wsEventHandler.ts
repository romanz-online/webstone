import { EventType } from './constants.ts'

const eventHandlers: any = {}

const wsEventHandler = ({
  socket,
  event,
  onSuccess,
  onFailure = () => {},
}: {
  socket: WebSocket
  event: EventType
  onSuccess: (data: any) => void
  onFailure?: (data: any) => void
}): void => {
  if (!eventHandlers[event]) {
    eventHandlers[event] = []
  }

  eventHandlers[event].push({ onSuccess, onFailure })

  socket.addEventListener('message', (evt: any): void => {
    const { eventType, success, data } = JSON.parse(evt.data)

    // not the right instance of wsEventHandler for this signature
    if (event != eventType) return

    // no handlers specified for the signature
    if (!eventHandlers[eventType]) return

    eventHandlers[eventType].forEach((handler: any) => {
      console.log(success ? 'SUCCESS' : 'FAIL', eventType)

      if (success) {
        handler.onSuccess(data)
      } else {
        handler.onFailure(data)
      }
    })
  })
}

export default wsEventHandler
